import type {BoxProps, StackProps} from "@chakra-ui/react";
import {Box, Span, VStack} from "@chakra-ui/react";

import {useCallback, useEffect, useRef, useState} from "react";

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

interface IInFlightFileUpload {
    readonly file: File;

    readonly progress: number | null;
}

interface IDropboxProps extends Omit<BoxProps, "asChild" | "children"> {
    readonly onHandleFileInput: (files: FileList) => void;
}

interface IEmptyDropboxProps extends IDropboxProps {
    readonly helpText?: string;
}

interface IFilledDropboxProps extends IDropboxProps {
    readonly completedFileUploads: IFileLike[];

    readonly inFlightFileUploads: Map<string, IInFlightFileUpload>;
}

export interface IFileLike {
    readonly name: string;

    readonly size: number;

    readonly type: string;
}

export interface IFileUploadDropboxProps
    extends Omit<BoxProps, "asChild" | "children"> {
    readonly completedFileUploads?: IFileLike[];

    readonly helpText?: string;

    readonly onFileUpload: IFileUploadCallback;

    readonly onFileUploadComplete?: IFileUploadCompleteCallback;

    readonly onFileUploadError?: IFileUploadErrorCallback;
}

function EmptyDropbox(props: IEmptyDropboxProps) {
    const {helpText, onHandleFileInput, ...rest} = props;

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
            borderWidth="medium"
            borderStyle={isDraggedOver ? "solid" : "dashed"}
            borderColor={isDraggedOver ? "cyan.solid" : "border.emphasized"}
            bg={isDraggedOver ? "cyan.50" : undefined}
            cursor="pointer"
            _hover={{
                bg: "bg.subtle",
                borderColor: "fg.subtle",
            }}
            {...rest}
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

function FilledDropbox(props: IFilledDropboxProps) {
    const {
        completedFileUploads,
        inFlightFileUploads,
        onHandleFileInput,
        ...rest
    } = props;

    return (
        <VStack
            alignItems="stretch"
            gap="2"
            padding="3"
            maxBlockSize="full"
            bg="bg.muted"
            borderColor="border"
            borderStyle="solid"
            borderWidth="thin"
            overflowBlock="auto"
            overflowInline="hidden"
            // **HACK:** We are only expecting basic `BoxProps` to be passed onto
            // `FilledDropbox`... any conflict with `StackProps` sucks but the
            // consuming code should not be using them anyway. The forward props
            // is for monkey patching `FileUploadDropbox` to adhere better to any
            // given layout.
            {...(rest as unknown as StackProps)}
        >
            <span>hello world</span>
        </VStack>
    );
}

export default function FileUploadDropbox(props: IFileUploadDropboxProps) {
    const {
        completedFileUploads = [],
        helpText,
        onFileUpload,
        onFileUploadComplete,
        onFileUploadError,
        ...rest
    } = props;

    const inFlightRequests = useRef<Map<string, XMLHttpRequest>>(new Map());
    const [inFlightFileUploads, setInFlightFileUploads] = useState<
        Map<string, IInFlightFileUpload>
    >(new Map());

    const hasExistingFileUploads =
        completedFileUploads.length > 0 || inFlightFileUploads.size > 0;

    const onHandleFileInput = useCallback(
        (async (files) => {
            const {current: requests} = inFlightRequests;

            for (const file of files) {
                const uuid = crypto.randomUUID();

                const xhr = new XMLHttpRequest();
                const {upload} = xhr;

                const onProgress = ((event) => {
                    const {lengthComputable, loaded, total} = event;

                    if (lengthComputable) {
                        const progress = loaded / total;

                        setInFlightFileUploads((currentInFlightFileUploads) => {
                            const uploadingFile =
                                currentInFlightFileUploads.get(uuid)!;

                            currentInFlightFileUploads = new Map(
                                currentInFlightFileUploads,
                            );

                            currentInFlightFileUploads.set(uuid, {
                                ...uploadingFile,

                                progress,
                            });

                            return currentInFlightFileUploads;
                        });
                    }
                }) satisfies OmitThisParameter<
                    Exclude<XMLHttpRequestEventTarget["onprogress"], null>
                >;

                const onLoad = ((_event) => {
                    setInFlightFileUploads((currentInFlightFileUploads) => {
                        currentInFlightFileUploads = new Map(
                            currentInFlightFileUploads,
                        );

                        currentInFlightFileUploads.delete(uuid);
                        return currentInFlightFileUploads;
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

                    requests.delete(uuid);
                }) satisfies OmitThisParameter<
                    Exclude<XMLHttpRequestEventTarget["onload"], null>
                >;

                const onError = ((_event) => {
                    setInFlightFileUploads((currentInFlightFileUploads) => {
                        currentInFlightFileUploads = new Map(
                            currentInFlightFileUploads,
                        );

                        currentInFlightFileUploads.delete(uuid);
                        return currentInFlightFileUploads;
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

                    requests.delete(uuid);
                }) satisfies OmitThisParameter<
                    Exclude<XMLHttpRequestEventTarget["onerror"], null>
                >;

                setInFlightFileUploads((currentInFlightFileUploads) => {
                    currentInFlightFileUploads = new Map(
                        currentInFlightFileUploads,
                    );

                    currentInFlightFileUploads.set(uuid, {
                        file,

                        progress: null,
                    });

                    return currentInFlightFileUploads;
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
                requests.set(uuid, xhr);
            }
        }) satisfies IDropboxProps["onHandleFileInput"],

        [
            onFileUpload,
            onFileUploadComplete,
            onFileUploadError,
            setInFlightFileUploads,
        ],
    );

    useEffect(() => {
        const {current: requests} = inFlightRequests;

        return () => {
            for (const request of requests.values()) {
                request.abort();
            }
        };
    }, []);

    return hasExistingFileUploads ? (
        <FilledDropbox
            {...rest}
            completedFileUploads={completedFileUploads}
            inFlightFileUploads={inFlightFileUploads}
            onHandleFileInput={onHandleFileInput}
        />
    ) : (
        <EmptyDropbox
            {...rest}
            helpText={helpText}
            onHandleFileInput={onHandleFileInput}
        />
    );
}
