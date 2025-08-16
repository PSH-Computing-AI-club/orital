import type {InferSelectModel} from "drizzle-orm";
import {eq} from "drizzle-orm";

import type {
    ActionFunctionArgs,
    LoaderFunctionArgs,
    Session,
    SessionData,
    SessionStorage,
} from "react-router";
import {data, redirect} from "react-router";

import {buildAppURL, buildURLComponents} from "../../utils/url";

import type {IIdentifiablesTable} from "../database/tables/identifiables_table";

import {useTransaction} from "../state/transaction";

import {IGuardRequisiteFunc, IGuardHeadersFunc} from "./guard";

export interface ISessionGuard<
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

export interface ISessionGuardOptions<
    T extends IIdentifiablesTable,
    I extends InferSelectModel<T> = InferSelectModel<T>,
    D extends SessionData = SessionData,
    F extends SessionData = D,
    S extends SessionStorage<D, F> = SessionStorage<D, F>,
    K extends keyof D | keyof F = keyof D | keyof F,
    R extends I = I,
> {
    identifiableMapper?: (identifiable: InferSelectModel<T>) => R;

    idKey: K;

    redirectURL?: string | URL;

    sessionStorage: S;

    table: T;
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
    options: ISessionGuardOptions<T, I, D, F, S, K, R>,
): ISessionGuard<T, R, D, F> {
    const {identifiableMapper, idKey, redirectURL, sessionStorage, table} =
        options;

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

        const transaction = useTransaction();

        const [firstIdentifiable] = await transaction
            .select()
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
        const {url} = requestArgs.request;
        const callbackURL = buildURLComponents(url);

        const session = await getOptionalSession(requestArgs);

        if (!session) {
            if (redirectURL) {
                const normalizedURL =
                    typeof redirectURL === "string"
                        ? buildAppURL(redirectURL)
                        : // **HACK:** We are going to be mutating the input URL. So,
                          // we need a fresh copy to preserve immutability.
                          new URL(redirectURL);

                normalizedURL.searchParams.set("callbackURL", callbackURL);

                throw redirect(normalizedURL.toString());
            }

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
