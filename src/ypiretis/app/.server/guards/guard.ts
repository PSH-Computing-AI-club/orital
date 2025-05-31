import type {Session, SessionData} from "react-router";

export type IGuardRequisiteFunc<T = void> = (
    request: Request,
) => Promise<T> | T;

export type IGuardHeaderFunc<
    D extends SessionData = SessionData,
    F extends SessionData = D,
    N extends Session<D, F> = Session<D, F>,
> = (request: Request, session: N) => Promise<string> | string;
