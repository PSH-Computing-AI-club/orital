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

        findAllAttachments(targetID) {},

        async handleAttachment(targetID, user, file) {},
    };
}
