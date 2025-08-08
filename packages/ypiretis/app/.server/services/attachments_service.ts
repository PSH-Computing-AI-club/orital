import {and, eq, getTableColumns} from "drizzle-orm";

import type {
    IAttachmentsTable,
    ISelectAttachment,
} from "../database/tables/attachments_table";
import type {IIdentifiablesTable} from "../database/tables/identifiables_table";
import UPLOADS_TABLE from "../database/tables/uploads_table";

import {useTransaction} from "../state/transaction";

import type {IUpload} from "./uploads_service";
import {
    deleteOne as deleteOneUpload,
    handleOne as handleOneUpload,
} from "./uploads_service";
import type {IUser} from "./users_service";

export type IAttachment = ISelectAttachment;

export interface IAttachmentsServiceOptions<
    A extends IAttachmentsTable,
    T extends IIdentifiablesTable,
> {
    readonly attachmentsTable: A;

    readonly targetTable: T;

    readonly targetIDColumn: keyof T["$inferSelect"];
}

export interface IAttachmentsService {
    deleteOneAttachmentByInternalIDs(
        internalTargetID: number,
        internalUploadID: number,
    ): Promise<void>;

    deleteOneAttachmentByIDs(targetID: string, uploadID: string): Promise<void>;

    findAllAttachmentsByInternalID(
        internalTargetID: number,
    ): Promise<IUpload[]>;

    handleOneAttachmentByInternalID(
        internalTargetID: number,
        user: IUser,
        file: Bun.BunFile,
    ): Promise<IAttachment>;
}

export default function makeAttachmentsService<
    A extends IAttachmentsTable,
    T extends IIdentifiablesTable,
>(options: IAttachmentsServiceOptions<A, T>): IAttachmentsService {
    const {attachmentsTable, targetIDColumn, targetTable} = options;

    return {
        async deleteOneAttachmentByInternalIDs(
            internalTargetID,
            internalUploadID,
        ) {
            const transaction = useTransaction();

            const attachments = await transaction
                .delete(attachmentsTable)
                .where(
                    and(
                        eq(attachmentsTable.targetID, internalTargetID),
                        eq(attachmentsTable.uploadID, internalUploadID),
                    ),
                )
                .returning();

            if (attachments.length === 0) {
                throw ReferenceError(
                    `bad argument #0 or #1 to 'IAttachmentsService.deleteOneAttachmentByInternalIDs' (internal target ID '${internalTargetID}' or internal upload ID '${internalUploadID}' was not found)`,
                );
            }

            await deleteOneUpload(internalUploadID);
        },

        async deleteOneAttachmentByIDs(targetID, uploadID) {
            const transaction = useTransaction();

            const attachments = await transaction
                .delete(attachmentsTable)
                .where(
                    and(
                        eq(
                            attachmentsTable.targetID,
                            transaction
                                .select({id: targetTable.id})
                                .from(targetTable)
                                .where(
                                    eq(
                                        // @ts-expect-error - **HACK:** This column is
                                        // already statically checked against the table's
                                        // inferred select type.
                                        targetTable[targetIDColumn],
                                        targetID,
                                    ),
                                ),
                        ),

                        eq(
                            attachmentsTable.uploadID,
                            transaction
                                .select({id: UPLOADS_TABLE.id})
                                .from(UPLOADS_TABLE)
                                .where(eq(UPLOADS_TABLE.uploadID, uploadID)),
                        ),
                    ),
                )
                .returning({
                    internalUploadID: attachmentsTable.uploadID,
                });

            if (attachments.length === 0) {
                throw ReferenceError(
                    `bad argument #0 or #1 to 'IAttachmentsService.deleteOneAttachmentByIDs' (target ID '${targetID}' or upload ID '${uploadID}' was not found)`,
                );
            }

            const {internalUploadID} = attachments[0];

            await deleteOneUpload(internalUploadID);
        },

        findAllAttachmentsByInternalID(internalTargetID) {
            const transaction = useTransaction();

            return transaction
                .select(getTableColumns(UPLOADS_TABLE))
                .from(attachmentsTable)
                .where(eq(attachmentsTable.targetID, internalTargetID))
                .innerJoin(
                    UPLOADS_TABLE,
                    eq(attachmentsTable.uploadID, UPLOADS_TABLE.id),
                )
                .orderBy(UPLOADS_TABLE.fileName);
        },

        async handleOneAttachmentByInternalID(internalTargetID, user, file) {
            const {id: internalUploadID} = await handleOneUpload(user, file);

            const transaction = useTransaction();

            const [firstAttachment] = await transaction
                .insert(
                    // **HACK:** TypeScript cannot handle the complex typing using
                    // the base table as a generic. So, we have to forcibly cast it
                    // here.
                    attachmentsTable as IAttachmentsTable,
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
