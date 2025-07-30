import type {ISelectAttachment} from "../database/tables/attachments_table";

export interface IAttachmentsService {
    deleteAttachment(targetID: number, uploadID: number): Promise<void>;

    findAllAttachments(targetID: number): Promise<ISelectAttachment[]>;

    handleAttachment(targetID: number, file: File): Promise<ISelectAttachment>;
}
