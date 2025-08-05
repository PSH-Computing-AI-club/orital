import {Box, Span} from "@chakra-ui/react";

import {useCallback, useRef, useState} from "react";

import UploadIcon from "~/components/icons/upload_icon";

import useFileDialogClick from "~/hooks/file_dialog_click";
import useFileDrop from "~/hooks/file_drop";

import {getRequestBody} from "~/utils/request";

export const STATUS_CODE_PREFLIGHT_FAILED = -1;

export type IFileUploadCallback = (uuid: string, file: File) => Request;

export type IFileUploadCompleteCallback = (uuid: string, file: File) => void;

export type IFileUploadErrorCallback = (
    uuid: string,
    file: File,
    statusCode: number,
) => void;

interface IPendingUpload {
    readonly file: File;

    readonly progress: number | null;
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

    readonly onFileUploadError?: IFileUploadErrorCallback;
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
        onFileUpload,
        onFileUploadComplete,
        onFileUploadError,
    } = props;

    const [pendingUploads, setPendingUploads] = useState<
        Map<string, IPendingUpload>
    >(new Map());

    const onHandleFileInput = useCallback(
        (async (files) => {
            console.log("got files: ", {files});
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

                    const {status} = xhr;

                    if (status >= 200 && status < 300) {
                        if (onFileUploadComplete) {
                            onFileUploadComplete(uuid, file);
                        }
                    } else {
                        if (onFileUploadError) {
                            onFileUploadError(uuid, file, status);
                        }
                    }
                }) satisfies OmitThisParameter<
                    Exclude<XMLHttpRequestEventTarget["onload"], null>
                >;

                const onError = ((_event) => {
                    setPendingUploads((currentPendingUploads) => {
                        currentPendingUploads = new Map(currentPendingUploads);

                        currentPendingUploads.delete(uuid);
                        return currentPendingUploads;
                    });

                    if (onFileUploadError) {
                        onFileUploadError(
                            uuid,
                            file,
                            // **NOTE**: When the `onerror` called back that means
                            // the request was never even sent due to failing a
                            // browser security check (ex. CORS) or a failure in
                            // resolving connection to the endpoint (ex. DNS failue).
                            STATUS_CODE_PREFLIGHT_FAILED,
                        );
                    }
                }) satisfies OmitThisParameter<
                    Exclude<XMLHttpRequestEventTarget["onerror"], null>
                >;

                setPendingUploads((currentPendingUploads) => {
                    currentPendingUploads = new Map(currentPendingUploads);

                    currentPendingUploads.set(uuid, {
                        file,

                        progress: null,
                    });

                    return currentPendingUploads;
                });

                // **NOTE:** We are accepting `Request` objects here even though there
                // is extra legwork involved with getting its payload. We could have
                // just had the `onFileUpload` callback return a
                // `RequestInit & {url: string | URL}` record... but web developers are
                // probably more familiar with returning a `Request` object wholesale
                // and its corresponding API.
                const request = onFileUpload(uuid, file);
                const body = await getRequestBody(request);

                const {headers, method, url} = request;

                upload.onprogress = onProgress;

                xhr.onload = onLoad;
                xhr.onerror = onError;

                xhr.open(method, url, true);

                for (const entry of headers.entries()) {
                    const [name, value] = entry;

                    // **NOTE:** For multipart form data the browser automatically
                    // handles the setting of the `Content-Type` header. This is
                    // because the browser needs to set a special "boundary" string
                    // within the header so the web server can properly delimit the
                    // payload.
                    if (
                        name.toLowerCase() === "content-type" &&
                        value.toLowerCase().includes("multipart/form-data")
                    ) {
                        continue;
                    }

                    xhr.setRequestHeader(name, value);
                }

                xhr.send(body);
            }
        }) satisfies IDropboxProps["onHandleFileInput"],

        [
            onFileUpload,
            onFileUploadComplete,
            onFileUploadError,
            setPendingUploads,
        ],
    );

    return (
        <EmptyDropbox
            helpText={helpText}
            onHandleFileInput={onHandleFileInput}
        />
    );
}
