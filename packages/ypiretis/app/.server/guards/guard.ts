import type {Session, SessionData} from "react-router";

export const BEARER_TYPES = {
    cookie: "BEARER_COOKIE",
    header: "BEARER_HEADER",
} as const;

export type IBearerTypes = (typeof BEARER_TYPES)[keyof typeof BEARER_TYPES];

export interface IGuardBearerRequisiteFuncOptions {
    readonly bearerType?: IBearerTypes;
}

export type IGuardRequisiteFunc<T = void> = (
    request: Request,
) => Promise<T> | T;

export type IGuardBearerRequisiteFunc<T = void> = (
    request: Request,
    options?: IGuardBearerRequisiteFuncOptions,
) => Promise<T> | T;

export type IGuardHeadersFunc<
    D extends SessionData = SessionData,
    F extends SessionData = D,
    N extends Session<D, F> = Session<D, F>,
> = (request: Request, session: N) => Promise<HeadersInit> | HeadersInit;
