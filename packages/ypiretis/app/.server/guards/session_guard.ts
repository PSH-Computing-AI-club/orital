import type {InferSelectModel} from "drizzle-orm";
import {eq} from "drizzle-orm";

import type {Session, SessionData, SessionStorage} from "react-router";
import {data} from "react-router";

import DATABASE from "../configuration/database";

import type {IIdentifiablesTable} from "../database/tables/identifiables_table";

import {IGuardRequisiteFunc, IGuardHeaderFunc} from "./guard";

export interface ISessionGuards<
    T extends IIdentifiablesTable,
    I extends InferSelectModel<T> = InferSelectModel<T>,
    D extends SessionData = SessionData,
    F extends SessionData = D,
    N extends Session<D, F> = Session<D, F>,
> {
    readonly getGrantHeader: IGuardHeaderFunc<D, F, N>;

    readonly getRevokeHeader: IGuardHeaderFunc<D, F, N>;

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
    N extends Session<D, F> = Session<D, F>,
    K extends keyof D | keyof F = keyof D | keyof F,
>(table: T, sessionStorage: S, idKey: K): ISessionGuards<T, I, D, N> {
    const {commitSession, destroySession, getSession} = sessionStorage;

    return {
        getGrantHeader(_request, session) {
            return commitSession(session);
        },

        getRevokeHeader(_request, session) {
            return destroySession(session);
        },

        async requireAuthenticatedSession(request) {
            const {headers} = request;
            const cookie = headers.get("Cookie");

            if (!cookie) {
                throw data("Unauthorized", {
                    status: 401,
                });
            }

            const session = await getSession(cookie);

            // **HACK:** The typing for `Session.has` is very generous and allows
            // for untyped string keys. But, we want to strict type to keys we
            // can statically type.
            if (!session.has(idKey as string)) {
                throw data("Unauthorized", {
                    status: 401,
                });
            }

            // **HACK:** See above comment.
            const id = session.get(idKey as string);

            if (!id) {
                throw data("Unauthorized", {
                    status: 401,
                });
            }

            const [firstIdentifiable] = await DATABASE.select()
                .from(table)
                .where(eq(table.id, id))
                .limit(1);

            if (!firstIdentifiable) {
                throw data("Unauthorized", {
                    status: 401,
                });
            }

            return {
                // **HACK:** Drizzle's typing is too complex for TypeScript to
                // properly infer here. So, we got to forcibly cast it.
                identifiable: firstIdentifiable as I,
                session: session,
            };
        },

        async requireGuestSession(request) {
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
        },
    };
}
