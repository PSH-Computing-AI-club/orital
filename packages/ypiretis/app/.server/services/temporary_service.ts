import type {BunFile} from "bun";

import {mkdir, open} from "node:fs/promises";
import {join} from "node:path";
import {tmpdir} from "node:os";

import type {FileUpload} from "@remix-run/form-data-parser";

import {ulid} from "ulid";

import {sanitizeBasename} from "../utils/path";

import {PACKAGE_NAME} from "../../utils/constants";

const SYSTEM_TEMPORARY_DIRECTORY = tmpdir();

export async function getTemporaryDirectoryPath(): Promise<string> {
    const identifier = ulid();
    const directoryPath = join(
        SYSTEM_TEMPORARY_DIRECTORY,
        `${PACKAGE_NAME}.${identifier}`,
    );

    await mkdir(directoryPath, {
        recursive: true,
    });

    return directoryPath;
}

export async function getTemporaryFile(): Promise<BunFile> {
    const identifier = ulid();
    const filePath = join(
        SYSTEM_TEMPORARY_DIRECTORY,
        `${PACKAGE_NAME}.${identifier}`,
    );

    const handle = await open(filePath, "w");

    await handle.close();
    return Bun.file(filePath);
}

export async function handleFileUpload(
    fileUpload: FileUpload,
): Promise<BunFile> {
    const fileName = sanitizeBasename(fileUpload.name);

    const directoryPath = await getTemporaryDirectoryPath();
    const filePath = join(directoryPath, fileName);

    const file = Bun.file(filePath);

    await Bun.write(file, fileUpload);
    return file;
}
