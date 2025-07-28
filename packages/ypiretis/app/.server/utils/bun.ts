import {rename} from "fs/promises";

export function isBunFile(value: unknown): value is Bun.BunFile {
    // **SOURCE:** https://github.com/oven-sh/bun/issues/10481#issue-2261065385

    return (
        value instanceof Blob &&
        !(value instanceof File) &&
        "name" in value &&
        (value as any).name.length > 0
    );
}
