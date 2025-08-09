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
    deleteAllAttachmentsByID(targetID: string): Promise<void>;

    deleteAllAttachmentsByInternalID(internalTargetID: number): Promise<void>;

    deleteOneAttachmentByInternalIDs(
        internalTargetID: number,
        internalUploadID: number,
    ): Promise<void>;

    deleteOneAttachmentByIDs(targetID: string, uploadID: string): Promise<void>;

    findAllAttachmentsByID(targetID: string): Promise<IUpload[]>;

    findAllAttachmentsByInternalID(
        internalTargetID: number,
    ): Promise<IUpload[]>;

    handleOneAttachmentByID(
        targetID: string,
        user: IUser,
        file: Bun.BunFile,
    ): Promise<IAttachment>;

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

    const handleOneAttachmentByInternalID = (async (
        internalTargetID,
        user,
        file,
    ) => {
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
    }) satisfies IAttachmentsService["handleOneAttachmentByInternalID"];

    return {
        handleOneAttachmentByInternalID,

        async deleteAllAttachmentsByInternalID(
            internalTargetID: number,
        ): Promise<void> {
            const transaction = useTransaction();

            const attachments = await transaction
                .delete(attachmentsTable)
                .where(eq(attachmentsTable.targetID, internalTargetID))
                .returning();

            if (attachments.length === 0) {
                return;
            }

            await Promise.all(
                attachments.map((upload) => {
                    const {uploadID: internalUploadID} = upload;

                    return deleteOneUpload(internalUploadID);
                }),
            );
        },

        async deleteAllAttachmentsByID(targetID: string): Promise<void> {
            const transaction = useTransaction();

            const attachments = await transaction
                .delete(attachmentsTable)
                .where(
                    eq(
                        attachmentsTable.targetID,

                        transaction
                            .select({id: targetTable.id})
                            .from(targetTable)
                            .where(
                                // @ts-expect-error - **HACK:** This column is
                                // already statically checked against the table's
                                // inferred select type.
                                eq(targetTable[targetIDColumn], targetID),
                            ),
                    ),
                )
                .returning();

            if (attachments.length === 0) {
                return;
            }

            await Promise.all(
                attachments.map((upload) => {
                    const {uploadID: internalUploadID} = upload;

                    return deleteOneUpload(internalUploadID);
                }),
            );
        },

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
                            transaction.select().from(targetTable).where(
                                eq(
                                    // @ts-expect-error - See note above in `deleteAllAttachmentsByID`.
                                    targetTable[targetIDColumn],
                                    targetID,
                                ),
                            ),
                        ),

                        eq(
                            attachmentsTable.uploadID,
                            transaction
                                .select()
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

        async findAllAttachmentsByID(targetID) {
            const transaction = useTransaction();

            return transaction
                .select(getTableColumns(UPLOADS_TABLE))
                .from(attachmentsTable)
                .where(
                    eq(
                        attachmentsTable.targetID,
                        transaction.select().from(targetTable).where(
                            // @ts-expect-error - See note above in `deleteAllAttachmentsByID`.
                            eq(targetTable[targetIDColumn], targetID),
                        ),
                    ),
                )
                .innerJoin(
                    UPLOADS_TABLE,
                    eq(attachmentsTable.uploadID, UPLOADS_TABLE.id),
                )
                .orderBy(UPLOADS_TABLE.fileName);
        },

        async handleOneAttachmentByID(targetID, user, file) {
            const transaction = useTransaction();

            const [firstTarget] = await transaction
                .select()
                .from(targetTable)
                .where(
                    // @ts-expect-error - See note above in `deleteAllAttachmentsByID`.
                    eq(targetTable[targetIDColumn], targetID),
                )
                .limit(1);

            if (!firstTarget) {
                throw new ReferenceError(
                    `bad argument #0 to 'IAttachmentsService.handleOneAttachmentByID' (target ID '${targetID}' was not found)`,
                );
            }

            const {id: internalTargetID} = firstTarget;

            return handleOneAttachmentByInternalID(
                internalTargetID,
                user,
                file,
            );
        },
    };
}
