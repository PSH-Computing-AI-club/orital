import {eq} from "drizzle-orm";

import DATABASE from "../configuration/database";
import type {
    IAttachmentsTable,
    ISelectAttachment,
} from "../database/tables/attachments_table";

import type {IUser} from "./users_service";

export interface IAttachmentsServiceOptions<T extends IAttachmentsTable> {
    readonly table: T;
}

export interface IAttachmentsService {
    deleteAttachment(targetID: number, uploadID: number): Promise<void>;

    findAllAttachments(targetID: number): Promise<ISelectAttachment[]>;

    handleAttachment(
        targetID: number,
        user: IUser,
        file: Bun.BunFile,
    ): Promise<ISelectAttachment>;
}

export function makeAttachmentsService<T extends IAttachmentsTable>(
    options: IAttachmentsServiceOptions<T>,
): IAttachmentsService {
    const {table} = options;

    return {
        deleteAttachment(targetID, uploadID) {},

        findAllAttachments(targetID) {
            return DATABASE.select()
                .from(table)
                .where(eq(table.targetID, targetID));
        },

        async handleAttachment(targetID, user, file) {},
    };
}
