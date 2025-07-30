import {mkdir, rm} from "node:fs/promises";
import {basename, join} from "node:path";

import {eq} from "drizzle-orm";

import {ulid} from "ulid";

import DATABASE from "../configuration/database";
import ENVIRONMENT from "../configuration/environment";

import type {ISelectUpload} from "../database/tables/uploads_table";
import UPLOADS_TABLE from "../database/tables/uploads_table";

import {moveFile} from "../utils/bun";

import type {IUser} from "./users_service";

const {UPLOADS_DIRECTORY_PATH} = ENVIRONMENT;

export type IUpload = ISelectUpload;

export async function deleteOneUpload(uploadID: number): Promise<void> {
    const upload = await DATABASE.query.uploads.findFirst({
        where: eq(UPLOADS_TABLE.id, uploadID),
    });

    if (!upload) {
        throw ReferenceError(
            `bad argument #0 to 'deleteFile' (upload ID '${uploadID}' was not found)`,
        );
    }

    const {uploadID: uploadULID} = upload;
    const uploadDirectoryPath = join(UPLOADS_DIRECTORY_PATH, uploadULID);

    await rm(uploadDirectoryPath, {
        force: true,
        recursive: true,
    });

    await DATABASE.delete(UPLOADS_TABLE).where(eq(UPLOADS_TABLE.id, uploadID));
}

export async function handleOneUpload(
    uploader: IUser,
    file: Bun.BunFile,
): Promise<IUpload> {
    const {name: filePath, size: fileSize, type: mimeType} = file;
    const {id: userID} = uploader;

    if (!filePath) {
        throw TypeError(
            `bad argument #0 to 'handleFile' ('Bun.BunFile.name' was 'undefined')`,
        );
    }

    const fileName = basename(filePath);
    const uploadID = ulid();

    const uploadDirectoryPath = join(UPLOADS_DIRECTORY_PATH, uploadID);
    const uploadFilePath = join(uploadDirectoryPath, fileName);

    await mkdir(uploadDirectoryPath, {
        recursive: true,
    });

    await moveFile(file, uploadFilePath);

    const [upload] = await DATABASE.insert(UPLOADS_TABLE)
        .values({
            fileName,
            fileSize,
            mimeType,
            uploadID,

            uploaderUserID: userID,
        })
        .returning();

    return upload;
}
