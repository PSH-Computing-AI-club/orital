import DATABASE from "../configuration/database";
import ENVIRONMENT from "../configuration/environment";

import type {
    IInsertUpload,
    ISelectUpload,
} from "../database/tables/uploads_table";
import UPLOADS_TABLE from "../database/tables/uploads_table";

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
