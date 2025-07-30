import {eq} from "drizzle-orm";

import DATABASE from "../configuration/database";
import type {
    IAttachmentsTable,
    ISelectAttachment,
} from "../database/tables/attachments_table";

import {handleFile} from "./uploads_service";
import type {IUser} from "./users_service";

export type IAttachment = ISelectAttachment;

export interface IAttachmentsServiceOptions<T extends IAttachmentsTable> {
    readonly table: T;
}

export interface IAttachmentsService {
    deleteOneAttachment(targetID: number, uploadID: number): Promise<void>;

    findAllAttachmentsByTargetID(targetID: number): Promise<IAttachment[]>;

    handleAttachment(
        targetID: number,
        user: IUser,
        file: Bun.BunFile,
    ): Promise<IAttachment>;
}

export function makeAttachmentsService<T extends IAttachmentsTable>(
    options: IAttachmentsServiceOptions<T>,
): IAttachmentsService {
    const {table} = options;

    return {
        deleteOneAttachment(targetID, uploadID) {},

        findAllAttachmentsByTargetID(targetID) {
            return DATABASE.select()
                .from(table)
                .where(eq(table.targetID, targetID));
        },

        async handleAttachment(targetID, user, file) {
            const upload = await handleFile(user, file);

            const {id: uploadID} = upload;
            const [firstAttachment] = await DATABASE.insert(
                // **HACK:** TypeScript cannot handle the complex typing using
                // the base table as a generic. So, we have to forcibly cast it
                // here.
                table as IAttachmentsTable,
            )
                .values({
                    uploadID,
                    targetID,
                })
                .returning();

            return firstAttachment;
        },
    };
}
