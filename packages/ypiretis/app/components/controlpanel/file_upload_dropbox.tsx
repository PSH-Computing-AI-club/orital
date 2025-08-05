import {Box, Span} from "@chakra-ui/react";

import {useCallback, useRef, useState} from "react";

import UploadIcon from "~/components/icons/upload_icon";

import useFileDialogClick from "~/hooks/file_dialog_click";
import useFileDrop from "~/hooks/file_drop";

export type IFileUploadCompleteCallback = (uuid: string) => void;

export type IFileUploadCallback = (
    xhr: XMLHttpRequest,
    uuid: string,
    file: File,
) => void;

interface IPendingUpload {
    readonly file: File;

    readonly progress: number;
}

interface IDropboxProps {
    readonly onHandleFileInput: (files: FileList) => void;
}

interface IEmptyDropboxProps extends IDropboxProps {
    readonly helpText?: string;
}

export interface IFileLike {
    readonly name: string;

    readonly size: number;

    readonly type: string;
}

export interface IUploadDropboxProps {
    readonly completeFileUploads?: IFileLike[];

    readonly helpText?: string;

    readonly onFileUpload: IFileUploadCallback;

    readonly onFileUploadComplete?: IFileUploadCompleteCallback;
}

function EmptyDropbox(props: IEmptyDropboxProps) {
    const {helpText, onHandleFileInput} = props;

    const boxRef = useRef<HTMLDivElement | null>(null);

    const inputElement = useFileDialogClick({
        handleFileInput: onHandleFileInput,
        ref: boxRef,
    });

    const isDraggedOver = useFileDrop({
        handleFileDrop: onHandleFileInput,
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

export default function FileUploadDropbox(props: IUploadDropboxProps) {
    const {
        completeFileUploads = [],
        helpText,
        onFileUploadComplete,
        onFileUpload,
    } = props;

    const [pendingUploads, setPendingUploads] = useState<
        Map<string, IPendingUpload>
    >(new Map());

    const onHandleFileInput = useCallback(
        ((files) => {
            for (const file of files) {
                const uuid = crypto.randomUUID();

                const xhr = new XMLHttpRequest();
                const {upload} = xhr;

                const onProgress = ((event) => {
                    if (event.lengthComputable) {
                        const progress = (event.loaded / event.total) * 100;

                        setPendingUploads((currentPendingUploads) => {
                            const uploadingFile =
                                currentPendingUploads.get(uuid)!;

                            currentPendingUploads = new Map(
                                currentPendingUploads,
                            );

                            currentPendingUploads.set(uuid, {
                                ...uploadingFile,

                                progress,
                            });

                            return currentPendingUploads;
                        });
                    }
                }) satisfies OmitThisParameter<
                    Exclude<XMLHttpRequestEventTarget["onprogress"], null>
                >;

                const onLoad = ((_event) => {
                    setPendingUploads((currentPendingUploads) => {
                        currentPendingUploads = new Map(currentPendingUploads);

                        currentPendingUploads.delete(uuid);
                        return currentPendingUploads;
                    });

                    if (onFileUploadComplete) {
                        onFileUploadComplete(uuid);
                    }
                }) satisfies OmitThisParameter<
                    Exclude<XMLHttpRequestEventTarget["onload"], null>
                >;

                const onError = ((_event) => {
                    // **TODO:** Handle error state.

                    onLoad(_event);
                }) satisfies OmitThisParameter<
                    Exclude<XMLHttpRequestEventTarget["onerror"], null>
                >;

                setPendingUploads((currentPendingUploads) => {
                    currentPendingUploads = new Map(currentPendingUploads);

                    currentPendingUploads.set(uuid, {
                        file,

                        progress: 0,
                    });

                    return currentPendingUploads;
                });

                upload.onprogress = onProgress;

                xhr.onload = onLoad;
                xhr.onerror = onError;

                onFileUpload(xhr, uuid, file);
            }
        }) satisfies IDropboxProps["onHandleFileInput"],

        [onFileUploadComplete, onFileUpload],
    );

    return (
        <EmptyDropbox
            helpText={helpText}
            onHandleFileInput={onHandleFileInput}
        />
    );
}
