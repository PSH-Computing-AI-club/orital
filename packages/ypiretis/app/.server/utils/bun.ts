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

export async function moveFile(
    sourceFilePath: string | Bun.BunFile,
    destinationFilePath: string,
): Promise<Bun.BunFile> {
    const sourceFile =
        typeof sourceFilePath === "string"
            ? Bun.file(sourceFilePath)
            : sourceFilePath;

    const destinationFile = Bun.file(destinationFilePath);

    try {
        await rename(sourceFile.name!, destinationFilePath);
    } catch (error) {
        if (
            error instanceof Error &&
            "code" in error &&
            error.code === "EXDEV"
        ) {
            await Bun.write(destinationFile, sourceFile);
            await sourceFile.unlink();
        } else {
            throw error;
        }
    }

    return destinationFile;
}
