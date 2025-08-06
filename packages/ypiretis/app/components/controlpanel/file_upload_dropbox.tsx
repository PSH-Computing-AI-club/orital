import type {BoxProps} from "@chakra-ui/react";
import {Box, Span} from "@chakra-ui/react";

import {format} from "bytes";

import type {ReactNode} from "react";
import {memo, useCallback, useEffect, useRef, useState} from "react";

import UploadIcon from "~/components/icons/upload_icon";

import useFileDialogClick from "~/hooks/file_dialog_click";
import useFileDrop from "~/hooks/file_drop";

import {determineMimeTypeIcon} from "~/utils/mime_types";
import {getRequestBody} from "~/utils/request";

import type {IListTileRootProps} from "./list_tile";
import ListTile from "./list_tile";
import type {IScrollableListAreaProps} from "./scrollable_list_area";
import ScrollableListArea from "./scrollable_list_area";

const MemoizedFilledDropboxItem = memo(FilledDropboxItem);

export const STATUS_CODE_PREFLIGHT_FAILED = -1;

export type IFileUploadCallback = (id: string, file: File) => Request;

export type IFileUploadCompleteCallback = (id: string, file: File) => void;

export type IFileUploadErrorCallback = (
    id: string,
    file: File,
    statusCode: number,
) => void;

export type IRenderCompletedFileUploadActions = (
    file: IFileUploadLike,
) => ReactNode;

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
    readonly completedFileUploads: IFileUploadLike[];

    readonly inFlightFileUploads: Map<string, IInFlightFileUpload>;

    readonly renderCompletedFileUploadActions?: IRenderCompletedFileUploadActions;
}

interface IFilledDropboxItemProps extends IListTileRootProps {
    readonly name: string;

    readonly size: number;

    readonly type: string;
}

export interface IFileUploadLike {
    readonly id: string;

    readonly name: string;

    readonly size: number;

    readonly type: string;
}

export interface IFileUploadDropboxProps
    extends Omit<BoxProps, "asChild" | "children"> {
    readonly completedFileUploads?: IFileUploadLike[];

    readonly helpText?: string;

    readonly onFileUpload: IFileUploadCallback;

    readonly onFileUploadComplete?: IFileUploadCompleteCallback;

    readonly onFileUploadError?: IFileUploadErrorCallback;

    readonly renderCompletedFileUploadActions?: IRenderCompletedFileUploadActions;
}

function FilledDropboxItem(props: IFilledDropboxItemProps) {
    const {children, name, size, type, ...rest} = props;

    const Icon = determineMimeTypeIcon(type);
    const sizeText = format(size, {
        unitSeparator: " ",
    });

    return (
        <ListTile.Root {...rest}>
            <ListTile.Icon>
                <Icon />
            </ListTile.Icon>

            <ListTile.Header>
                <ListTile.Title>{name}</ListTile.Title>
                <ListTile.SubTitle>{sizeText}</ListTile.SubTitle>
            </ListTile.Header>

            {children ? <ListTile.Footer>{children}</ListTile.Footer> : <></>}
        </ListTile.Root>
    );
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
        renderCompletedFileUploadActions,
        ...rest
    } = props;

    const areaRef = useRef<HTMLDivElement | null>(null);

    const isDraggedOver = useFileDrop({
        handleFileDrop: onHandleFileInput,
        ref: areaRef,
    });

    return (
        <ScrollableListArea
            ref={areaRef}
            position="relative"
            // **HACK:** We are only expecting basic `BoxProps` to be passed onto
            // `FilledDropbox`... any conflict with `IScrollableListArea` sucks but
            // the consuming code should not be using them anyway. The forward props
            // is for monkey patching `FileUploadDropbox` to adhere better to any
            // given layout.
            {...(rest as unknown as IScrollableListAreaProps)}
        >
            {Array.from(inFlightFileUploads.entries()).map((entry, _index) => {
                const [id, fileUpload] = entry;

                const {file, progress} = fileUpload;
                const {name, size, type} = file;

                return (
                    <MemoizedFilledDropboxItem
                        key={id}
                        name={name}
                        size={size}
                        type={type}
                    />
                );
            })}

            {completedFileUploads.map((file, _index) => {
                const {id, name, size, type} = file;

                return (
                    <MemoizedFilledDropboxItem
                        key={id}
                        name={name}
                        size={size}
                        type={type}
                    >
                        {renderCompletedFileUploadActions
                            ? renderCompletedFileUploadActions(file)
                            : null}
                    </MemoizedFilledDropboxItem>
                );
            })}

            <Box
                position="absolute"
                inset="0"
                bg="color-mix(in lch, var(--chakra-colors-cyan-50), transparent 75%)"
                borderWidth="medium"
                borderStyle="solid"
                borderColor="cyan.solid"
                visibility={isDraggedOver ? "visible" : "hidden"}
                pointerEvents="none"
            />
        </ScrollableListArea>
    );
}

export default function FileUploadDropbox(props: IFileUploadDropboxProps) {
    const {
        completedFileUploads = [],
        helpText,
        onFileUpload,
        onFileUploadComplete,
        onFileUploadError,
        renderCompletedFileUploadActions,
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
                const id = crypto.randomUUID();

                const xhr = new XMLHttpRequest();
                const {upload} = xhr;

                const onProgress = ((event) => {
                    const {lengthComputable, loaded, total} = event;

                    if (lengthComputable) {
                        const progress = loaded / total;

                        setInFlightFileUploads((currentInFlightFileUploads) => {
                            const fileUpload =
                                currentInFlightFileUploads.get(id)!;

                            currentInFlightFileUploads = new Map(
                                currentInFlightFileUploads,
                            );

                            currentInFlightFileUploads.set(id, {
                                ...fileUpload,

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

                        currentInFlightFileUploads.delete(id);
                        return currentInFlightFileUploads;
                    });

                    const {status} = xhr;

                    if (status >= 200 && status < 300) {
                        if (onFileUploadComplete) {
                            onFileUploadComplete(id, file);
                        }
                    } else {
                        if (onFileUploadError) {
                            onFileUploadError(id, file, status);
                        }
                    }

                    requests.delete(id);
                }) satisfies OmitThisParameter<
                    Exclude<XMLHttpRequestEventTarget["onload"], null>
                >;

                const onError = ((_event) => {
                    setInFlightFileUploads((currentInFlightFileUploads) => {
                        currentInFlightFileUploads = new Map(
                            currentInFlightFileUploads,
                        );

                        currentInFlightFileUploads.delete(id);
                        return currentInFlightFileUploads;
                    });

                    if (onFileUploadError) {
                        onFileUploadError(
                            id,
                            file,
                            // **NOTE**: When the `onerror` called back that means
                            // the request was never even sent due to failing a
                            // browser security check (ex. CORS) or a failure in
                            // resolving connection to the endpoint (ex. DNS failue).
                            STATUS_CODE_PREFLIGHT_FAILED,
                        );
                    }

                    requests.delete(id);
                }) satisfies OmitThisParameter<
                    Exclude<XMLHttpRequestEventTarget["onerror"], null>
                >;

                setInFlightFileUploads((currentInFlightFileUploads) => {
                    currentInFlightFileUploads = new Map(
                        currentInFlightFileUploads,
                    );

                    currentInFlightFileUploads.set(id, {
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
                const request = onFileUpload(id, file);
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
                requests.set(id, xhr);
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
            renderCompletedFileUploadActions={renderCompletedFileUploadActions}
        />
    ) : (
        <EmptyDropbox
            {...rest}
            helpText={helpText}
            onHandleFileInput={onHandleFileInput}
        />
    );
}
