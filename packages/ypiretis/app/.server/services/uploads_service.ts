import {mkdir, rm} from "node:fs/promises";
import {basename, join} from "node:path";

import {eq} from "drizzle-orm";

import {ulid} from "ulid";

import ENVIRONMENT from "../configuration/environment";

import type {ISelectUpload} from "../database/tables/uploads_table";
import UPLOADS_TABLE from "../database/tables/uploads_table";

import {useTransaction} from "../state/transaction";

import {moveFile} from "../utils/bun";

import type {IUser} from "./users_service";

const {UPLOADS_DIRECTORY_PATH} = ENVIRONMENT;

export type IUpload = ISelectUpload;

export async function deleteOneUpload(internalUploadID: number): Promise<void> {
    const transaction = useTransaction();

    const upload = await transaction.query.uploads.findFirst({
        where: eq(UPLOADS_TABLE.id, internalUploadID),
    });

    if (!upload) {
        throw ReferenceError(
            `bad argument #0 to 'deleteOneUpload' (upload ID '${internalUploadID}' was not found)`,
        );
    }

    const {uploadID} = upload;
    const uploadDirectoryPath = join(UPLOADS_DIRECTORY_PATH, uploadID);

    await rm(uploadDirectoryPath, {
        force: true,
        recursive: true,
    });

    await transaction
        .delete(UPLOADS_TABLE)
        .where(eq(UPLOADS_TABLE.id, internalUploadID));
}

export async function handleOneUpload(
    uploader: IUser,
    file: Bun.BunFile,
): Promise<IUpload> {
    const {name: filePath, size: fileSize, type: mimeType} = file;
    const {id: userID} = uploader;

    if (!filePath) {
        throw TypeError(
            `bad argument #0 to 'handleOneUpload' ('Bun.BunFile.name' was 'undefined')`,
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

    const transaction = useTransaction();

    const [upload] = await transaction
        .insert(UPLOADS_TABLE)
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
