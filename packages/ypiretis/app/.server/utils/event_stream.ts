// **HACK:** These typings are not exported by `remix-utils/sse/server`. So,
// we need to declare them here instead for our usage.

export type IAbortFunction = () => void;

export type ISendFunction = (args: ISendFunctionArgs) => void;

export interface ISendFunctionArgs {
    readonly data: string;

    readonly event?: string;

    readonly id?: string;
}
