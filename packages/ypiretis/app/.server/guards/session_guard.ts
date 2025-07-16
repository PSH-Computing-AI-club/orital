import type {InferSelectModel} from "drizzle-orm";
import {eq} from "drizzle-orm";

import type {
    ActionFunctionArgs,
    LoaderFunctionArgs,
    Session,
    SessionData,
    SessionStorage,
} from "react-router";
import {data} from "react-router";

import DATABASE from "../configuration/database";

import type {IIdentifiablesTable} from "../database/tables/identifiables_table";

import {IGuardRequisiteFunc, IGuardHeadersFunc} from "./guard";

export interface ISessionGuards<
    T extends IIdentifiablesTable,
    I extends InferSelectModel<T> = InferSelectModel<T>,
    D extends SessionData = SessionData,
    F extends SessionData = D,
    N extends Session<D, F> = Session<D, F>,
> {
    readonly getGrantHeaders: IGuardHeadersFunc<D, F, N>;

    readonly getOptionalSession: IGuardRequisiteFunc<{
        identifiable: I;
        session: N;
    } | null>;

    readonly getRevokeHeaders: IGuardHeadersFunc<D, F, N>;

    readonly requireAuthenticatedSession: IGuardRequisiteFunc<{
        identifiable: I;
        session: N;
    }>;

    readonly requireGuestSession: IGuardRequisiteFunc<{session: N}>;
}

export default function makeSessionGuard<
    T extends IIdentifiablesTable,
    I extends InferSelectModel<T> = InferSelectModel<T>,
    D extends SessionData = SessionData,
    F extends SessionData = D,
    S extends SessionStorage<D, F> = SessionStorage<D, F>,
    K extends keyof D | keyof F = keyof D | keyof F,
    R extends I = I,
>(
    table: T,
    sessionStorage: S,
    idKey: K,
    identifiableMapper?: (identifiable: InferSelectModel<T>) => R,
): ISessionGuards<T, R, D, F> {
    const {commitSession, destroySession, getSession} = sessionStorage;

    async function getGrantHeaders(
        _requestArgs: ActionFunctionArgs | LoaderFunctionArgs,
        session: Session<D, F>,
    ) {
        const setCookieHeader = await commitSession(session);

        return {
            "Set-Cookie": setCookieHeader,
        };
    }

    async function getOptionalSession(
        requestArgs: ActionFunctionArgs | LoaderFunctionArgs,
    ) {
        const {request} = requestArgs;
        const {headers} = request;

        const cookie = headers.get("Cookie");

        if (!cookie) {
            return null;
        }

        const session = await getSession(cookie);

        // **HACK:** The typing for `Session.has` is very generous and allows
        // for untyped string keys. But, we want to strict type to keys we
        // can statically type.
        if (!session.has(idKey as string)) {
            return null;
        }

        // **HACK:** See above comment.
        const id = session.get(idKey as string);

        if (!id) {
            return null;
        }

        const [firstIdentifiable] = await DATABASE.select()
            .from(table)
            .where(eq(table.id, id))
            .limit(1);

        if (!firstIdentifiable) {
            return null;
        }

        const mappedIdentifiable = identifiableMapper
            ? identifiableMapper(
                  // **HACK:** Drizzle's typing is too complex for TypeScript to
                  // properly infer here. So, we got to forcibly cast it.
                  firstIdentifiable as I,
              )
            : (firstIdentifiable as I);

        return {
            identifiable: mappedIdentifiable as unknown as R,
            session: session,
        };
    }

    async function getRevokeHeaders(
        _requestArgs: ActionFunctionArgs | LoaderFunctionArgs,
        session: Session<D, F>,
    ) {
        const setCookieHeader = await destroySession(session);

        return {
            "Set-Cookie": setCookieHeader,
        };
    }

    async function requireAuthenticatedSession(
        requestArgs: ActionFunctionArgs | LoaderFunctionArgs,
    ) {
        const session = await getOptionalSession(requestArgs);

        if (!session) {
            throw data("Unauthorized", {
                status: 401,
            });
        }

        return session;
    }

    async function requireGuestSession(
        requestArgs: ActionFunctionArgs | LoaderFunctionArgs,
    ) {
        const {request} = requestArgs;
        const {headers} = request;

        const cookie = headers.get("Cookie");
        const session = await getSession(cookie);

        if (
            cookie &&
            // **HACK:** See comment in `requireAuthenticatedSession`.
            session.has(idKey as string)
        ) {
            throw data("Forbidden", {
                status: 403,
            });
        }

        return {
            session,
        };
    }

    return {
        getGrantHeaders,
        getOptionalSession,
        getRevokeHeaders,
        requireAuthenticatedSession,
        requireGuestSession,
    };
}
