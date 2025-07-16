import type {
    ActionFunctionArgs,
    LoaderFunctionArgs,
    Session,
    SessionData,
} from "react-router";

export const BEARER_TYPES = {
    cookie: "BEARER_COOKIE",
    header: "BEARER_HEADER",
} as const;

export type IBearerTypes = (typeof BEARER_TYPES)[keyof typeof BEARER_TYPES];

export interface IGuardBearerRequisiteFuncOptions {
    readonly bearerType?: IBearerTypes;
}

export type IGuardRequisiteFunc<T = void> = (
    requestArgs: ActionFunctionArgs | LoaderFunctionArgs,
) => Promise<T> | T;

export type IGuardBearerRequisiteFunc<T = void> = (
    requestArgs: ActionFunctionArgs | LoaderFunctionArgs,
    options?: IGuardBearerRequisiteFuncOptions,
) => Promise<T> | T;

export type IGuardHeadersFunc<
    D extends SessionData = SessionData,
    F extends SessionData = D,
    N extends Session<D, F> = Session<D, F>,
> = (
    requestArgs: ActionFunctionArgs | LoaderFunctionArgs,
    session: N,
) => Promise<HeadersInit> | HeadersInit;
