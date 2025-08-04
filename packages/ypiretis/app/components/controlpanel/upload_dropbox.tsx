import {Box, Span} from "@chakra-ui/react";

import UploadIcon from "../icons/upload_icon";

export type IUploadCompleteCallback = () => void;

export type IUploadFileCallback = (xhr: XMLHttpRequest, file: File) => void;

export interface IUploadDropboxProps {
    readonly helpText?: string;

    readonly onUploadComplete?: IUploadCompleteCallback;

    readonly onUploadFile: IUploadFileCallback;
}

export default function UploadDropbox(props: IUploadDropboxProps) {
    const {helpText} = props;

    return (
        <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            blockSize="full"
            inlineSize="full"
            borderWidth="medium"
            borderStyle="dashed"
            borderColor="border.emphasized"
            _hover={{
                bg: "bg.subtle",
                borderColor: "fg.subtle",
            }}
        >
            <UploadIcon marginBlockEnd="2" fontSize="3xl" />

            <Span>Drag and drop files here</Span>
            {helpText ? (
                <Span color="fg.muted" fontSize="smaller">
                    {helpText}
                </Span>
            ) : (
                <></>
            )}
        </Box>
    );
}
