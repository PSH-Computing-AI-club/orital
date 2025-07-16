import type {
    ActionFunctionArgs,
    LoaderFunctionArgs,
    Session,
    SessionData,
} from "react-router";

import {
    commitSession as _commitSession,
    destroySession as _destroySession,
    getSession as _getSession,
} from "../configuration/ephemeral_session";

export type IFlashSession = Session<IFlashSessionData, IFlashSessionData>;

export interface IFlashSessionData extends SessionData {
    readonly bearer?: string;
}

export const commitSession = async (session: IFlashSession) => {
    const setCookieHeader = await _commitSession(session);

    return {
        "Set-Cookie": setCookieHeader,
    };
};

export const destroySession = async (session: IFlashSession) => {
    const setCookieHeader = await _destroySession(session);

    return {
        "Set-Cookie": setCookieHeader,
    };
};

export const getSession = (
    requestArgs: ActionFunctionArgs | LoaderFunctionArgs,
) => {
    const {request} = requestArgs;
    const {headers} = request;

    const cookieHeader = headers.get("Cookie");

    return _getSession(cookieHeader) as Promise<IFlashSession>;
};
