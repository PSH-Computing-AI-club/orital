import {and, eq} from "drizzle-orm";

import DATABASE from "../configuration/database";
import type {
    IAttachmentsTable,
    ISelectAttachment,
} from "../database/tables/attachments_table";

import {deleteOneUpload, handleOneUpload} from "./uploads_service";
import type {IUser} from "./users_service";

export type IAttachment = ISelectAttachment;

export interface IAttachmentsServiceOptions<T extends IAttachmentsTable> {
    readonly table: T;
}

export interface IAttachmentsService {
    deleteOneAttachment(targetID: number, uploadID: number): Promise<void>;

    findAllAttachmentsByTargetID(targetID: number): Promise<IAttachment[]>;

    handleOneAttachment(
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
        async deleteOneAttachment(targetID, uploadID) {
            const attachments = await DATABASE.delete(table)
                .where(
                    and(
                        eq(table.targetID, targetID),
                        eq(table.uploadID, uploadID),
                    ),
                )
                .returning();

            if (attachments.length === 0) {
                throw ReferenceError(
                    `bad argument #0 or #1 to 'IAttachmentsService.deleteOneAttachment' (target ID '${targetID}' or upload ID '${uploadID}' was not found)`,
                );
            }

            await deleteOneUpload(uploadID);
        },

        findAllAttachmentsByTargetID(targetID) {
            return DATABASE.select()
                .from(table)
                .where(eq(table.targetID, targetID));
        },

        async handleOneAttachment(targetID, user, file) {
            const upload = await handleOneUpload(user, file);

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
