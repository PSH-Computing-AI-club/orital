import {eq} from "drizzle-orm";

import DATABASE from "../configuration/database";
import type {
    IAttachmentsTable,
    ISelectAttachment,
} from "../database/tables/attachments_table";

import type {IUser} from "./users_service";

export interface IAttachmentsService {
    deleteAttachment(targetID: number, uploadID: number): Promise<void>;

    findAllAttachments(targetID: number): Promise<ISelectAttachment[]>;

    handleAttachment(
        targetID: number,
        user: IUser,
        file: Bun.BunFile,
    ): Promise<ISelectAttachment>;
}

export function makeAttachmentsService<A extends IAttachmentsTable>(
    attachmentsTable: A,
): IAttachmentsService {
    return {
        deleteAttachment(targetID, uploadID) {},

        findAllAttachments(targetID) {
            return DATABASE.select()
                .from(attachmentsTable)
                .where(eq(attachmentsTable.targetID, targetID));
        },

        async handleAttachment(targetID, user, file) {},
    };
}
