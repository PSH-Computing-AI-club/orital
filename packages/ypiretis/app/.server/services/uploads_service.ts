import {mkdir, rename} from "node:fs/promises";
import {basename, join} from "node:path";

import DATABASE from "../configuration/database";
import ENVIRONMENT from "../configuration/environment";

import type {
    IInsertUpload,
    ISelectUpload,
} from "../database/tables/uploads_table";
import UPLOADS_TABLE from "../database/tables/uploads_table";

import {moveFile} from "../utils/bun";

import type {IUser} from "./users_service";

const {UPLOADS_DIRECTORY_PATH} = ENVIRONMENT;

export type IUpload = ISelectUpload;

export type IUploadInsert = Omit<
    IInsertUpload,
    "createdAt" | "id" | "uploadID"
>;

async function insertOne(uploadInsert: IUploadInsert): Promise<IUpload> {
    const [upload] = await DATABASE.insert(UPLOADS_TABLE)
        .values(uploadInsert)
        .returning();

    return upload;
}

export async function handleFile(
    file: Bun.BunFile,
    uploader: IUser,
): Promise<IUpload> {
    const {name: filePath, size: fileSize, type: mimeType} = file;
    const {id: userID} = uploader;

    if (!filePath) {
        throw ReferenceError(
            `bad argument #0 to 'handleFile' ('Bun.BunFile.name' was 'undefined')`,
        );
    }

    const fileName = basename(filePath);

    const upload = await insertOne({
        fileName,
        fileSize,
        mimeType,

        uploaderUserID: userID,
    });

    const {uploadID} = upload;

    const uploadDirectoryPath = join(UPLOADS_DIRECTORY_PATH, uploadID);
    const uploadFilePath = join(uploadDirectoryPath, fileName);

    await mkdir(uploadDirectoryPath, {
        recursive: true,
    });

    await moveFile(file, uploadFilePath);
    return upload;
}
