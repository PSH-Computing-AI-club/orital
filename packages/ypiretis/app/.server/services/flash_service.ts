import type {Session, SessionData} from "react-router";

import {
    commitSession as _commitSession,
    destroySession as _destroySession,
    getSession as _getSession,
} from "../configuration/ephemeral_session";

export type IFlashSession = Session<IFlashSessionData, IFlashSessionData>;

export interface IFlashSessionData extends SessionData {
    readonly bearer?: string;
}

export const commitSession = (session: IFlashSession) =>
    _commitSession(session);

export const destroySession = (session: IFlashSession) =>
    _destroySession(session);

export const getSession = (cookieHeader: string) =>
    _getSession(cookieHeader) as Promise<IFlashSession>;
