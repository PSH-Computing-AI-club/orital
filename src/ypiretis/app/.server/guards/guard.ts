export type IGuardFunc<T = void> = (request: Request) => Promise<T> | T;
