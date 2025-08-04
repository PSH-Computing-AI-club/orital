import {Box, Span} from "@chakra-ui/react";

import {useCallback, useRef, useState} from "react";

import UploadIcon from "~/components/icons/upload_icon";

import useFileDialogClick from "~/hooks/file_dialog_click";
import useFileDrop from "~/hooks/file_drop";

export type IUploadCompleteCallback = () => void;

export type IUploadFileCallback = (xhr: XMLHttpRequest, file: File) => void;

interface IUploadingFile {
    readonly file: File;

    readonly progress: number;
}

export interface IUploadLike {
    readonly name: string;

    readonly size: number;

    readonly type: string;
}

export interface IUploadDropboxProps {
    readonly completeUploads?: IUploadLike[];

    readonly helpText?: string;

    readonly onUploadComplete?: IUploadCompleteCallback;

    readonly onUploadFile: IUploadFileCallback;
}

export default function UploadDropbox(props: IUploadDropboxProps) {
    const {
        completeUploads = [],
        helpText,
        onUploadComplete,
        onUploadFile,
    } = props;

    const boxRef = useRef<HTMLDivElement | null>(null);
    const uploadingFiles = useState<Map<string, IUploadingFile>>(new Map());

    const handleFileInput = useCallback((files: FileList) => {
        for (const file of files) {
            // **TODO:** Create XHR and call onUploadFile for each file.
        }
    }, []);

    const isDraggedOver = useFileDrop({
        handleFileDrop: handleFileInput,
        ref: boxRef,
    });

    const inputElement = useFileDialogClick({
        handleFileInput,
        ref: boxRef,
    });

    return (
        <Box
            ref={boxRef}
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            blockSize="full"
            inlineSize="full"
            borderWidth="medium"
            borderStyle={isDraggedOver ? "solid" : "dashed"}
            borderColor={isDraggedOver ? "cyan.solid" : "border.emphasized"}
            bg={isDraggedOver ? "cyan.50" : undefined}
            cursor="pointer"
            _hover={{
                bg: "bg.subtle",
                borderColor: "fg.subtle",
            }}
        >
            {inputElement}

            <UploadIcon marginBlockEnd="2" fontSize="3xl" />

            <Span>Drag and drop files here, or click to select</Span>

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
