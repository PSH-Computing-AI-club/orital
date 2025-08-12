import type {SessionData} from "react-router";
import {createCookieSessionStorage} from "react-router";

import RUNTIME_ENVIRONMENT from "./runtime_environment";

import {UNIX_EPOCH} from "../utils/temporal";

const {APP_URL, SECRET_KEY, SESSION_PERSISTENT_TTL} = RUNTIME_ENVIRONMENT;

const {
    getSession: _getSession,
    commitSession: _commitSession,
    destroySession: _destroySession,
} = createCookieSessionStorage<SessionData>({
    cookie: {
        name: "persistent",

        domain: APP_URL.hostname,
        path: "/",
        sameSite: "strict",

        httpOnly: true,
        secure: true,

        secrets: [SECRET_KEY.expose()],

        maxAge: SESSION_PERSISTENT_TTL.total({
            relativeTo: UNIX_EPOCH,
            unit: "seconds",
        }),
    },
});

export const commitSession = _commitSession;

export const destroySession = _destroySession;

export const getSession = _getSession;
