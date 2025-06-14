import type {SessionData} from "react-router";
import {createCookieSessionStorage} from "react-router";

import {UNIX_EPOCH} from "../utils/temporal";

import ENVIRONMENT from "./environment";

const {APP_URL, SECRET_KEY, SESSION_EPHEMERAL_TTL} = ENVIRONMENT;

const {
    getSession: _getSession,
    commitSession: _commitSession,
    destroySession: _destroySession,
} = createCookieSessionStorage<SessionData>({
    cookie: {
        name: "ephemeral",

        domain: APP_URL.hostname,
        path: "/",
        sameSite: "strict",

        httpOnly: true,
        secure: true,

        secrets: [SECRET_KEY.expose()],

        maxAge: SESSION_EPHEMERAL_TTL.total({
            relativeTo: UNIX_EPOCH,
            unit: "seconds",
        }),
    },
});

export const commitSession = _commitSession;

export const destroySession = _destroySession;

export const getSession = _getSession;
