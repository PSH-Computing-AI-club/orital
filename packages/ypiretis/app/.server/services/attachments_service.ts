import {and, eq, getTableColumns} from "drizzle-orm";

import type {
    IAttachmentsTable,
    ISelectAttachment,
} from "../database/tables/attachments_table";
import UPLOADS_TABLE from "../database/tables/uploads_table";

import {useTransaction} from "../state/transaction";

import type {IUpload} from "./uploads_service";
import {
    deleteOne as deleteOneUpload,
    handleOne as handleOneUpload,
} from "./uploads_service";
import type {IUser} from "./users_service";

export type IAttachment = ISelectAttachment;

export interface IAttachmentsServiceOptions<T extends IAttachmentsTable> {
    readonly table: T;
}

export interface IAttachmentsService {
    deleteOneAttachment(
        internalTargetID: number,
        internalUploadID: number,
    ): Promise<void>;

    findAllAttachmentsByTargetID(internalTargetID: number): Promise<IUpload[]>;

    handleOneAttachment(
        internalTargetID: number,
        user: IUser,
        file: Bun.BunFile,
    ): Promise<IAttachment>;
}

export default function makeAttachmentsService<T extends IAttachmentsTable>(
    options: IAttachmentsServiceOptions<T>,
): IAttachmentsService {
    const {table} = options;

    return {
        async deleteOneAttachment(internalTargetID, internalUploadID) {
            const transaction = useTransaction();

            const attachments = await transaction
                .delete(table)
                .where(
                    and(
                        eq(table.targetID, internalTargetID),
                        eq(table.uploadID, internalUploadID),
                    ),
                )
                .returning();

            if (attachments.length === 0) {
                throw ReferenceError(
                    `bad argument #0 or #1 to 'IAttachmentsService.deleteOneAttachment' (target ID '${internalTargetID}' or upload ID '${internalUploadID}' was not found)`,
                );
            }

            await deleteOneUpload(internalUploadID);
        },

        findAllAttachmentsByTargetID(internalTargetID) {
            const transaction = useTransaction();

            return transaction
                .select(getTableColumns(UPLOADS_TABLE))
                .from(table)
                .where(eq(table.targetID, internalTargetID))
                .innerJoin(UPLOADS_TABLE, eq(table.uploadID, UPLOADS_TABLE.id));
        },

        async handleOneAttachment(internalTargetID, user, file) {
            const upload = await handleOneUpload(user, file);

            const {id: internalUploadID} = upload;

            const transaction = useTransaction();

            const [firstAttachment] = await transaction
                .insert(
                    // **HACK:** TypeScript cannot handle the complex typing using
                    // the base table as a generic. So, we have to forcibly cast it
                    // here.
                    table as IAttachmentsTable,
                )
                .values({
                    uploadID: internalUploadID,
                    targetID: internalTargetID,
                })
                .returning();

            return firstAttachment;
        },
    };
}
