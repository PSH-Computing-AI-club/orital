import type {
    EditableValueChangeDetails,
    RadioCardValueChangeDetails,
} from "@chakra-ui/react";
import {
    Button,
    Code,
    DataList,
    Field,
    Group,
    HStack,
    IconButton,
    Input,
    Spacer,
} from "@chakra-ui/react";

import {Temporal} from "@js-temporal/polyfill";

import {format} from "bytes";

import type {FormEventHandler, MouseEventHandler} from "react";
import {lazy, useCallback, useEffect, useMemo, useRef, useState} from "react";

import {
    data,
    redirect,
    useFetcher,
    useLoaderData,
    useRevalidator,
} from "react-router";

import * as v from "valibot";

import {eq} from "~/.server/services/crud_service.filters";
import type {IEventStates} from "~/.server/services/events_service";
import {
    EVENT_STATES,
    deleteOne,
    deleteAllAttachmentsByID,
    deleteOneAttachmentByIDs,
    findOneWithPoster,
    findAllAttachmentsByInternalID,
    updateOne,
} from "~/.server/services/events_service";
import {formatMarkdown} from "~/.server/services/markdown";
import {requireAuthenticatedAdminSession} from "~/.server/services/users_service";

import {createTransaction} from "~/.server/state/transaction";

import {ulid} from "~/.server/utils/valibot";

import DatetimeText from "~/components/common/datetime_text";

import type {
    IFileUploadAbortCallback,
    IFileUploadCallback,
    IFileUploadCompleteCallback,
    IFileUploadErrorCallback,
    IFileUploadLike,
    IRenderCompletedFileUploadActions,
} from "~/components/controlpanel/file_upload_dropbox";
import FileUploadDropbox from "~/components/controlpanel/file_upload_dropbox";
import ListTile from "~/components/controlpanel/list_tile";
import Layout from "~/components/controlpanel/layout";
import type {
    IChangeCallback,
    IEditorMode,
} from "~/components/controlpanel/markdown_editor";
import RadioCardGroup from "~/components/controlpanel/radio_card_group";
import SectionCard from "~/components/controlpanel/section_card";
import TabbedDataSectionCard from "~/components/controlpanel/tabbed_data_section_card";
import TabbedSectionCard from "~/components/controlpanel/tabbed_section_card";
import Title from "~/components/controlpanel/title";
import {TOAST_STATUS, useToastsContext} from "~/components/controlpanel/toasts";

import ArticleIcon from "~/components/icons/article_icon";
import CopyIcon from "~/components/icons/copy_icon";
import DownloadIcon from "~/components/icons/download_icon";
import EyeIcon from "~/components/icons/eye_icon";
import EyeClosedIcon from "~/components/icons/eye_closed_icon";
import InfoBoxIcon from "~/components/icons/info_box_icon";
import LinkIcon from "~/components/icons/link_icon";
import SlidersIcon from "~/components/icons/sliders_icon";
import TrashIcon from "~/components/icons/trash_icon";

import {validateFormData, validateParams} from "~/guards/validation";

import {EVENTS_ATTACHMENTS_MAX_FILE_SIZE} from "~/utils/constants";
import {toLocalISOString} from "~/utils/datetime";
import {buildFormData} from "~/utils/forms";
import {truncateTextMiddle} from "~/utils/string";
import {buildAppURL} from "~/utils/url";
import {number, title} from "~/utils/valibot";

import type {IActionFormData as IUploadActionFormData} from "./admin_.calendar_.events_.$eventID_.actions_.upload";

import {Route} from "./+types/admin_.calendar.events.$eventID";

const MarkdownEditor = lazy(
    () => import("~/components/controlpanel/markdown_editor"),
);

const FILE_NAME_MAX_LENGTH = 52;

const MAX_FILE_SIZE_TEXT = format(EVENTS_ATTACHMENTS_MAX_FILE_SIZE, {
    unitSeparator: " ",
});

const ATTACHMENT_DELETE_ACTION_FORM_DATA_SCHEMA = v.object({
    action: v.literal("attachment.delete"),

    uploadID: ulid,
});

const CONTENT_UPDATE_ACTION_FORM_DATA_SCHEMA = v.object({
    action: v.literal("content.update"),

    content: v.string(),
});

const END_AT_UPDATE_ACTION_FORM_DATA_SCHEMA = v.object({
    action: v.literal("endAt.update"),

    endAtTimestamp: number,
});

const PUBLISHED_AT_UPDATE_ACTION_FORM_DATA_SCHEMA = v.object({
    action: v.literal("publishedAt.update"),

    publishedAtTimestamp: number,
});

const SELF_DELETE_ACTION_FORM_DATA_SCHEMA = v.object({
    action: v.literal("self.delete"),
});

const START_AT_UPDATE_ACTION_FORM_DATA_SCHEMA = v.object({
    action: v.literal("startAt.update"),

    startAtTimestamp: number,
});

const STATE_UPDATE_ACTION_FORM_DATA_SCHEMA = v.object({
    action: v.literal("state.update"),

    state: v.pipe(
        v.string(),
        v.picklist([EVENT_STATES.draft, EVENT_STATES.published]),
    ),
});

const TITLE_UPDATE_ACTION_FORM_DATA_SCHEMA = v.object({
    action: v.literal("title.update"),

    title: v.pipe(v.string(), v.nonEmpty(), v.maxLength(64), title),
});

const ACTION_FORM_DATA_SCHEMA = v.variant("action", [
    ATTACHMENT_DELETE_ACTION_FORM_DATA_SCHEMA,
    CONTENT_UPDATE_ACTION_FORM_DATA_SCHEMA,
    END_AT_UPDATE_ACTION_FORM_DATA_SCHEMA,
    PUBLISHED_AT_UPDATE_ACTION_FORM_DATA_SCHEMA,
    SELF_DELETE_ACTION_FORM_DATA_SCHEMA,
    START_AT_UPDATE_ACTION_FORM_DATA_SCHEMA,
    STATE_UPDATE_ACTION_FORM_DATA_SCHEMA,
    TITLE_UPDATE_ACTION_FORM_DATA_SCHEMA,
]);

const ACTION_PARAMS_SCHEMA = v.object({
    eventID: ulid,
});

const LOADER_PARAMS_SCHEMA = v.object({
    eventID: ulid,
});

const UX_TITLE_SCHEMA = v.pipe(
    v.string(),
    v.nonEmpty(),
    v.maxLength(64),
    title,
);

type IActionFormDataSchema = v.InferOutput<typeof ACTION_FORM_DATA_SCHEMA>;

export async function action(actionArgs: Route.ActionArgs) {
    const {eventID} = validateParams(ACTION_PARAMS_SCHEMA, actionArgs);

    const actionFormData = await validateFormData(
        ACTION_FORM_DATA_SCHEMA,
        actionArgs,
    );

    const {action} = actionFormData;

    await requireAuthenticatedAdminSession(actionArgs);

    switch (action) {
        case "attachment.delete": {
            const {uploadID} = actionFormData;

            try {
                await createTransaction(() => {
                    return deleteOneAttachmentByIDs(eventID, uploadID);
                });
            } catch (error) {
                if (error instanceof ReferenceError) {
                    throw data("Not Found", {
                        status: 404,
                    });
                }

                throw error;
            }

            break;
        }

        case "content.update": {
            const {content: unformattedContent} = actionFormData;

            const formattedContent = await formatMarkdown(unformattedContent);

            const event = await updateOne({
                where: eq("eventID", eventID),

                values: {
                    content: formattedContent,
                },
            });

            if (event === null) {
                throw data("Not Found", {
                    status: 404,
                });
            }

            break;
        }

        case "endAt.update": {
            const {endAtTimestamp} = actionFormData;

            const endAt =
                Temporal.Instant.fromEpochMilliseconds(endAtTimestamp);

            const event = await updateOne({
                where: eq("eventID", eventID),

                values: {
                    endAt,
                },
            });

            if (event === null) {
                throw data("Not Found", {
                    status: 404,
                });
            }

            break;
        }

        case "publishedAt.update": {
            const {publishedAtTimestamp} = actionFormData;

            const publishedAt =
                Temporal.Instant.fromEpochMilliseconds(publishedAtTimestamp);

            const event = await updateOne({
                where: eq("eventID", eventID),

                values: {
                    publishedAt,
                },
            });

            if (event === null) {
                throw data("Not Found", {
                    status: 404,
                });
            }

            break;
        }

        case "self.delete": {
            try {
                await createTransaction(async () => {
                    await deleteAllAttachmentsByID(eventID);

                    return deleteOne({
                        where: eq("eventID", eventID),
                    });
                });
            } catch (error) {
                if (error instanceof ReferenceError) {
                    throw data("Not Found", {
                        status: 404,
                    });
                }

                throw error;
            }

            return redirect("/admin/news");
        }

        case "startAt.update": {
            const {startAtTimestamp} = actionFormData;

            const startAt =
                Temporal.Instant.fromEpochMilliseconds(startAtTimestamp);

            const event = await updateOne({
                where: eq("eventID", eventID),

                values: {
                    startAt,
                },
            });

            if (event === null) {
                throw data("Not Found", {
                    status: 404,
                });
            }

            break;
        }

        case "state.update": {
            const {state} = actionFormData;

            const publishedAt =
                state === EVENT_STATES.draft ? null : Temporal.Now.instant();

            const event = await updateOne({
                where: eq("eventID", eventID),

                values: {
                    publishedAt,
                    state,
                },
            });

            if (event === null) {
                throw data("Not Found", {
                    status: 404,
                });
            }

            break;
        }

        case "title.update": {
            const {title} = actionFormData;

            const event = await updateOne({
                where: eq("eventID", eventID),

                values: {
                    title,
                },
            });

            if (event === null) {
                throw data("Not Found", {
                    status: 404,
                });
            }

            break;
        }
    }
}

export async function loader(loaderArgs: Route.LoaderArgs) {
    const {eventID} = validateParams(LOADER_PARAMS_SCHEMA, loaderArgs);

    const event = await findOneWithPoster({
        where: eq("eventID", eventID),
    });

    if (event === null) {
        throw data("Not Found", {
            status: 404,
        });
    }

    const {
        content,
        createdAt,
        endAt,
        id: internalID,
        poster,
        publishedAt,
        startAt,
        state,
        title,
        updatedAt,
    } = event;
    const {accountID, firstName, lastName} = poster;

    const attachments = (await findAllAttachmentsByInternalID(internalID)).map(
        (upload) => {
            const {fileName, fileSize, mimeType, uploadID} = upload;

            return {
                fileName,
                fileSize,
                mimeType,
                uploadID,
            };
        },
    );

    const {epochMilliseconds: createdAtTimestamp} = createdAt;
    const {epochMilliseconds: updatedAtTimestamp} = updatedAt;

    const endAtTimestamp = endAt?.epochMilliseconds ?? null;
    const publishedAtTimestamp = publishedAt?.epochMilliseconds ?? null;
    const startAtTimestamp = startAt?.epochMilliseconds ?? null;

    return {
        attachments,

        event: {
            content,
            createdAtTimestamp,
            endAtTimestamp,
            eventID,
            publishedAtTimestamp,
            startAtTimestamp,
            state,
            title,
            updatedAtTimestamp,
        },

        poster: {
            accountID,
            firstName,
            lastName,
        },
    };
}

function FileNameCode(props: {readonly fileName: string}) {
    const {fileName} = props;

    return <Code>{truncateTextMiddle(fileName, FILE_NAME_MAX_LENGTH)}</Code>;
}

function ContentCard() {
    const {event} = useLoaderData<typeof loader>();

    const {content: loaderContent} = event;

    const contentUpdateFetcher = useFetcher();
    const [isLiveContentDirty, setIsLiveContentDirty] =
        useState<boolean>(false);
    const [liveContent, setLiveContent] = useState<string>(loaderContent);
    const {displayToast} = useToastsContext();

    const onContentUpdateClick = useCallback(
        (async (_event) => {
            await contentUpdateFetcher.submit(
                {
                    action: "content.update",
                    content: liveContent,
                } satisfies IActionFormDataSchema,

                {
                    method: "POST",
                },
            );

            setIsLiveContentDirty(false);
            displayToast({
                status: TOAST_STATUS.success,
                title: "Updated event's content",
            });
        }) satisfies MouseEventHandler<HTMLButtonElement>,

        [
            contentUpdateFetcher,
            displayToast,
            liveContent,
            setIsLiveContentDirty,
        ],
    );

    const onMarkdownChange = useCallback(
        ((markdown, initialMarkdownNormalize) => {
            if (initialMarkdownNormalize) {
                return;
            }

            setLiveContent(markdown);
            setIsLiveContentDirty(true);
        }) satisfies IChangeCallback,

        [setIsLiveContentDirty, setLiveContent],
    );

    const isContentUpdateFetcherIdle = contentUpdateFetcher.state === "idle";

    const isContentUpdateDisabled =
        !isContentUpdateFetcherIdle || !isLiveContentDirty;

    return (
        <TabbedDataSectionCard.Root flexGrow="1">
            <TabbedDataSectionCard.Body>
                <TabbedDataSectionCard.Title>
                    Content
                    <Spacer />
                    <TabbedDataSectionCard.Tabs />
                    <Button
                        disabled={isContentUpdateDisabled}
                        colorPalette="green"
                        size="sm"
                        onClick={onContentUpdateClick}
                    >
                        Update Content
                    </Button>
                    <ArticleIcon />
                </TabbedDataSectionCard.Title>

                <TabbedDataSectionCard.Tab
                    label="Rich Text"
                    provider={() => "MODE_RICH_TEXT" satisfies IEditorMode}
                />

                <TabbedDataSectionCard.Tab
                    label="Source"
                    provider={() => "MODE_SOURCE" satisfies IEditorMode}
                />

                <TabbedDataSectionCard.View>
                    {(mode: IEditorMode) => (
                        <MarkdownEditor
                            markdown={liveContent}
                            mode={mode}
                            flexGrow="1"
                            height="0"
                            overflowX="hidden"
                            overflowY="auto"
                            onMarkdownChange={onMarkdownChange}
                        />
                    )}
                </TabbedDataSectionCard.View>
            </TabbedDataSectionCard.Body>
        </TabbedDataSectionCard.Root>
    );
}

function SettingsCardAttachmentsView() {
    const {attachments, event} = useLoaderData<typeof loader>();

    const deleteFetcher = useFetcher();
    const {revalidate} = useRevalidator();
    const {displayToast} = useToastsContext();

    const {eventID} = event;

    const isDeleteFetcherIdle = deleteFetcher.state === "idle";
    const isDeleteDisabled = !isDeleteFetcherIdle;

    const completeFileUploads = useMemo<IFileUploadLike[]>(() => {
        return attachments.map((attachment) => {
            const {fileName, fileSize, mimeType, uploadID} = attachment;

            return {
                id: uploadID,
                name: fileName,
                size: fileSize,
                type: mimeType,
            };
        });
    }, [attachments]);

    const onFileUpload = useCallback(
        ((_uuid, file) => {
            return new Request(
                `/admin/calendar/events/${eventID}/actions/upload`,
                {
                    method: "POST",

                    body: buildFormData<IUploadActionFormData>({
                        file,
                        action: "upload.file",
                    }),
                },
            );
        }) satisfies IFileUploadCallback,

        [eventID],
    );

    const onFileUploadAbort = useCallback(
        ((_uuid, file) => {
            const {name} = file;

            displayToast({
                status: TOAST_STATUS.warning,
                title: "Aborted file attachment upload",
                description: <FileNameCode fileName={name} />,
            });
        }) satisfies IFileUploadAbortCallback,

        [displayToast],
    );

    const onFileUploadComplete = useCallback(
        (async (_, file) => {
            const {name} = file;

            await revalidate();

            displayToast({
                status: TOAST_STATUS.success,
                title: "Uploaded file as an attachment",
                description: <FileNameCode fileName={name} />,
            });
        }) satisfies IFileUploadCompleteCallback,

        [revalidate, displayToast],
    );

    const onFileUploadError = useCallback(
        ((_uuid, file, status) => {
            const {name} = file;

            displayToast({
                status: TOAST_STATUS.error,
                title: (
                    <>
                        Failed to upload file as an attachment, status code:{" "}
                        <Code>{status}</Code>
                    </>
                ),
                description: <FileNameCode fileName={name} />,
            });
        }) satisfies IFileUploadErrorCallback,

        [displayToast],
    );

    const renderCompletedFileUploadActions = useCallback(
        ((file) => {
            const {id: uploadID, name} = file;

            const downloadURL = `/uploads/${uploadID}/${name}?forceDownload=true`;
            const embedURL = `/uploads/${uploadID}/${name}`;

            const copyURL = buildAppURL(embedURL);

            const onCopyClick = (async (_event) => {
                await navigator.clipboard.writeText(copyURL.toString());

                displayToast({
                    status: TOAST_STATUS.success,
                    title: "Copied the attachment's embeddable URL to clipboard",
                });
            }) satisfies MouseEventHandler<HTMLButtonElement>;

            const onDeleteClick = (async (_event) => {
                await deleteFetcher.submit(
                    {
                        action: "attachment.delete",
                        uploadID,
                    } satisfies IActionFormDataSchema,

                    {
                        method: "POST",
                    },
                );

                displayToast({
                    status: TOAST_STATUS.success,
                    title: "Deleted attachment",
                    description: <FileNameCode fileName={name} />,
                });
            }) satisfies MouseEventHandler<HTMLButtonElement>;

            return (
                <>
                    <ListTile.IconButton
                        colorPalette="green"
                        onClick={onCopyClick}
                    >
                        <CopyIcon />
                    </ListTile.IconButton>

                    <ListTile.IconButton colorPalette="cyan" asChild>
                        <a href={downloadURL} target="_blank">
                            <DownloadIcon />
                        </a>
                    </ListTile.IconButton>

                    <ListTile.IconButton
                        disabled={isDeleteDisabled}
                        colorPalette="red"
                        onClick={onDeleteClick}
                    >
                        <TrashIcon />
                    </ListTile.IconButton>
                </>
            );
        }) satisfies IRenderCompletedFileUploadActions,

        [deleteFetcher, isDeleteDisabled, displayToast],
    );

    return (
        <TabbedSectionCard.View label="Attachments">
            <FileUploadDropbox
                completedFileUploads={completeFileUploads}
                helpText={`max file size ${MAX_FILE_SIZE_TEXT}`}
                blockSize="full"
                onFileUpload={onFileUpload}
                onFileUploadAbort={onFileUploadAbort}
                onFileUploadComplete={onFileUploadComplete}
                onFileUploadError={onFileUploadError}
                renderCompletedFileUploadActions={
                    renderCompletedFileUploadActions
                }
            />
        </TabbedSectionCard.View>
    );
}

function SettingsCardPublishingView() {
    const {event} = useLoaderData<typeof loader>();

    const {publishedAtTimestamp, state} = event;

    const publishedAtInputRef = useRef<HTMLInputElement | null>(null);

    const stateUpdateFetcher = useFetcher();
    const publishedAtUpdateFetcher = useFetcher();
    const {displayToast} = useToastsContext();

    const isDraft = state === "STATE_DRAFT";
    const isPublished = state === "STATE_PUBLISHED";

    const localPublishedAt = publishedAtTimestamp
        ? new Date(publishedAtTimestamp)
        : null;

    const localPublishedAtDateTime = localPublishedAt
        ? toLocalISOString(localPublishedAt)
        : null;

    const isStateUpdateFetcherIdle = stateUpdateFetcher.state === "idle";
    const isPublishedAtUpdateFetcherIdle =
        publishedAtUpdateFetcher.state === "idle";

    const [liveLocalPublishedAt, setLiveLocalPublishedAt] =
        useState<Date | null>(localPublishedAt);

    const isLiveLocalPublishedAtDirty =
        liveLocalPublishedAt?.getTime() !== localPublishedAt?.getTime();

    const isStateUpdateDisabled = !isStateUpdateFetcherIdle;
    const isPublishedAtFieldDisabled = !isPublishedAtUpdateFetcherIdle;
    const isPublishedAtUpdateDisabled =
        isDraft ||
        !isPublishedAtUpdateFetcherIdle ||
        !isLiveLocalPublishedAtDirty;

    const onStateChange = useCallback(
        (async (details) => {
            const {value} = details as {value: IEventStates};

            await stateUpdateFetcher.submit(
                {
                    action: "state.update",
                    state: value,
                } satisfies IActionFormDataSchema,

                {
                    method: "POST",
                },
            );

            displayToast({
                status: TOAST_STATUS.success,
                title: `Updated the event to be ${value === "STATE_PUBLISHED" ? "published" : "hidden"}`,
            });
        }) satisfies (details: RadioCardValueChangeDetails) => Promise<void>,

        [stateUpdateFetcher, displayToast],
    );

    const onPublishedAtChange = useCallback(
        ((event) => {
            const {target} = event;
            const {value} = target as HTMLInputElement;

            setLiveLocalPublishedAt(new Date(value));
        }) satisfies FormEventHandler<HTMLInputElement>,

        [setLiveLocalPublishedAt],
    );

    const onUpdatePublisheddAt = useCallback(
        (async (_event) => {
            if (!liveLocalPublishedAt) {
                return;
            }

            await publishedAtUpdateFetcher.submit(
                {
                    action: "publishedAt.update",
                    publishedAtTimestamp: liveLocalPublishedAt?.getTime(),
                } satisfies IActionFormDataSchema,

                {
                    method: "POST",
                },
            );

            displayToast({
                status: TOAST_STATUS.success,
                title: `Updated the event's publishing timestamp`,
            });
        }) satisfies MouseEventHandler<HTMLButtonElement>,

        [liveLocalPublishedAt, publishedAtUpdateFetcher, displayToast],
    );

    useEffect(() => {
        const {current: inputElement} = publishedAtInputRef;

        if (!inputElement || !isPublished || publishedAtTimestamp === null) {
            return;
        }

        const localPublishedAt = new Date(publishedAtTimestamp);
        const localPublishedAtDateTime = toLocalISOString(localPublishedAt);

        inputElement.value = localPublishedAtDateTime;
        setLiveLocalPublishedAt(localPublishedAt);
    }, [
        isPublished,
        publishedAtInputRef,
        publishedAtTimestamp,
        setLiveLocalPublishedAt,
    ]);

    return (
        <TabbedSectionCard.View label="Publishing">
            <Field.Root flexGrow="1">
                <Field.Label>Published At</Field.Label>

                <RadioCardGroup.Root
                    disabled={isStateUpdateDisabled}
                    value={state}
                    flexGrow="1"
                    onValueChange={onStateChange}
                >
                    <RadioCardGroup.Option
                        value={"STATE_DRAFT" satisfies IEventStates}
                        label="Draft"
                        icon={<EyeClosedIcon />}
                        colorPalette="red"
                    />

                    <RadioCardGroup.Option
                        value={"STATE_PUBLISHED" satisfies IEventStates}
                        label="Published"
                        icon={<EyeIcon />}
                        colorPalette="green"
                    />
                </RadioCardGroup.Root>
            </Field.Root>

            <Field.Root visibility={isDraft ? "hidden" : undefined}>
                <Field.Label>Published At</Field.Label>

                <Group alignSelf="stretch">
                    <Input
                        ref={publishedAtInputRef}
                        disabled={isPublishedAtFieldDisabled}
                        type="datetime-local"
                        defaultValue={localPublishedAtDateTime ?? ""}
                        flexGrow="1"
                        onChange={onPublishedAtChange}
                    />

                    <Button
                        disabled={isPublishedAtUpdateDisabled}
                        colorPalette="green"
                        onClick={onUpdatePublisheddAt}
                    >
                        Update Timestamp
                    </Button>
                </Group>
            </Field.Root>
        </TabbedSectionCard.View>
    );
}

function SettingsCardSchedulingView() {
    const {event} = useLoaderData<typeof loader>();

    const {endAtTimestamp, startAtTimestamp} = event;

    const startAtInputRef = useRef<HTMLInputElement | null>(null);
    const endAtInputRef = useRef<HTMLInputElement | null>(null);

    const startAtUpdateFetcher = useFetcher();
    const endAtUpdateFetcher = useFetcher();

    const {displayToast} = useToastsContext();

    const localEndAt = endAtTimestamp ? new Date(endAtTimestamp) : null;
    const localStartAt = startAtTimestamp ? new Date(startAtTimestamp) : null;

    const localEndAtDateTime = localEndAt ? toLocalISOString(localEndAt) : null;
    const localStartAtDateTime = localStartAt
        ? toLocalISOString(localStartAt)
        : null;

    const isEndAtUpdateFetcherIdle = endAtUpdateFetcher.state === "idle";
    const isStartAtUpdateFetcherIdle = startAtUpdateFetcher.state === "idle";

    const [liveLocalEndAt, setLiveLocalEndAt] = useState<Date | null>(
        localEndAt,
    );
    const [liveLocalStartAt, setLiveLocalStartAt] = useState<Date | null>(
        localStartAt,
    );

    const isLiveLocalEndAtDirty =
        liveLocalEndAt?.getTime() !== localEndAt?.getTime();
    const isLiveLocalStartAtDirty =
        liveLocalStartAt?.getTime() !== localStartAt?.getTime();

    const isEndAtFieldDisabled = !isEndAtUpdateFetcherIdle;
    const isStartAtFieldDisabled = !isStartAtUpdateFetcherIdle;

    const isEndAtUpdateDisabled =
        !isEndAtUpdateFetcherIdle || !isLiveLocalEndAtDirty;
    const isStartAtUpdateDisabled =
        !isStartAtUpdateFetcherIdle || !isLiveLocalStartAtDirty;

    const onEndAtChange = useCallback(
        ((event) => {
            const {target} = event;
            const {value} = target as HTMLInputElement;

            setLiveLocalEndAt(new Date(value));
        }) satisfies FormEventHandler<HTMLInputElement>,

        [setLiveLocalEndAt],
    );

    const onStartAtChange = useCallback(
        ((event) => {
            const {target} = event;
            const {value} = target as HTMLInputElement;

            setLiveLocalStartAt(new Date(value));
        }) satisfies FormEventHandler<HTMLInputElement>,

        [setLiveLocalStartAt],
    );

    const onUpdateEnddAt = useCallback(
        (async (_event) => {
            if (!liveLocalEndAt) {
                return;
            }

            await endAtUpdateFetcher.submit(
                {
                    action: "endAt.update",
                    endAtTimestamp: liveLocalEndAt?.getTime(),
                } satisfies IActionFormDataSchema,

                {
                    method: "POST",
                },
            );

            displayToast({
                status: TOAST_STATUS.success,
                title: `Updated the event's end timestamp`,
            });
        }) satisfies MouseEventHandler<HTMLButtonElement>,

        [liveLocalEndAt, endAtUpdateFetcher, displayToast],
    );

    const onUpdateStartdAt = useCallback(
        (async (_event) => {
            if (!liveLocalStartAt) {
                return;
            }

            await startAtUpdateFetcher.submit(
                {
                    action: "startAt.update",
                    startAtTimestamp: liveLocalStartAt?.getTime(),
                } satisfies IActionFormDataSchema,

                {
                    method: "POST",
                },
            );

            displayToast({
                status: TOAST_STATUS.success,
                title: `Updated the event's start timestamp`,
            });
        }) satisfies MouseEventHandler<HTMLButtonElement>,

        [liveLocalStartAt, startAtUpdateFetcher, displayToast],
    );

    useEffect(() => {
        const {current: inputElement} = endAtInputRef;

        if (!inputElement || endAtTimestamp === null) {
            return;
        }

        const localEndAt = new Date(endAtTimestamp);
        const localEndAtDateTime = toLocalISOString(localEndAt);

        inputElement.value = localEndAtDateTime;
        setLiveLocalEndAt(localEndAt);
    }, [endAtInputRef, endAtTimestamp, setLiveLocalEndAt]);

    useEffect(() => {
        const {current: inputElement} = startAtInputRef;

        if (!inputElement || startAtTimestamp === null) {
            return;
        }

        const localStartAt = new Date(startAtTimestamp);
        const localStartAtDateTime = toLocalISOString(localStartAt);

        inputElement.value = localStartAtDateTime;
        setLiveLocalStartAt(localStartAt);
    }, [startAtInputRef, startAtTimestamp, setLiveLocalStartAt]);

    return (
        <TabbedSectionCard.View label="Scheduling">
            <Field.Root>
                <Field.Label>Start At</Field.Label>

                <Group alignSelf="stretch">
                    <Input
                        ref={startAtInputRef}
                        disabled={isStartAtFieldDisabled}
                        type="datetime-local"
                        defaultValue={localStartAtDateTime ?? ""}
                        flexGrow="1"
                        onChange={onStartAtChange}
                    />

                    <Button
                        disabled={isStartAtUpdateDisabled}
                        colorPalette="green"
                        onClick={onUpdateStartdAt}
                    >
                        Update Timestamp
                    </Button>
                </Group>
            </Field.Root>

            <Field.Root>
                <Field.Label>End At</Field.Label>

                <Group alignSelf="stretch">
                    <Input
                        ref={endAtInputRef}
                        disabled={isEndAtFieldDisabled}
                        type="datetime-local"
                        defaultValue={localEndAtDateTime ?? ""}
                        flexGrow="1"
                        onChange={onEndAtChange}
                    />

                    <Button
                        disabled={isEndAtUpdateDisabled}
                        colorPalette="green"
                        onClick={onUpdateEnddAt}
                    >
                        Update Timestamp
                    </Button>
                </Group>
            </Field.Root>
        </TabbedSectionCard.View>
    );
}

function SettingsCard() {
    return (
        <TabbedSectionCard.Root flexGrow="1">
            <TabbedSectionCard.Body>
                <TabbedSectionCard.Title>
                    Settings
                    <Spacer />
                    <TabbedSectionCard.Tabs />
                    <SlidersIcon />
                </TabbedSectionCard.Title>

                <SettingsCardSchedulingView />
                <SettingsCardPublishingView />
                <SettingsCardAttachmentsView />
            </TabbedSectionCard.Body>
        </TabbedSectionCard.Root>
    );
}

function OverviewCard() {
    const {event, poster} = useLoaderData<typeof loader>();
    const {displayToast} = useToastsContext();

    const {
        createdAtTimestamp,
        eventID,
        publishedAtTimestamp,
        state,
        updatedAtTimestamp,
    } = event;
    const {accountID, firstName, lastName} = poster;

    const deleteEventFetcher = useFetcher();

    const href = `/calendar/events/${eventID}`;
    const url = buildAppURL(href);

    const isDeleteDeleteFetcherIdle = deleteEventFetcher.state === "idle";
    const isDeleteEventDisabled = !isDeleteDeleteFetcherIdle;

    const onCopyClick = useCallback(
        (async (_event) => {
            await navigator.clipboard.writeText(url.toString());

            displayToast({
                status: TOAST_STATUS.success,
                title: "Copied the event's permalink URL to clipboard",
            });
        }) satisfies MouseEventHandler<HTMLButtonElement>,

        [displayToast, url],
    );

    const onDeleteClick = useCallback(
        (async (_event) => {
            const response = prompt(
                `Confirm that you want to delete this event by typing "DELETE" below`,
            )?.toLowerCase() as "delete" | string | null;

            switch (response) {
                case "delete":
                    await deleteEventFetcher.submit(
                        {
                            action: "self.delete",
                        } satisfies IActionFormDataSchema,

                        {
                            method: "POST",
                        },
                    );

                    displayToast({
                        status: TOAST_STATUS.success,
                        title: "Deleted the event",
                    });

                    break;

                default:
                    displayToast({
                        status: TOAST_STATUS.warning,
                        title: "Event deletion was canceled",
                    });

                    break;
            }
        }) satisfies MouseEventHandler<HTMLButtonElement>,

        [deleteEventFetcher, displayToast],
    );

    return (
        <SectionCard.Root inlineSize="lg">
            <SectionCard.Body>
                <SectionCard.Title>
                    Overview
                    <Spacer />
                    <InfoBoxIcon />
                </SectionCard.Title>

                <DataList.Root orientation="horizontal">
                    <DataList.Item>
                        <DataList.ItemLabel>Event ID</DataList.ItemLabel>
                        <DataList.ItemValue>
                            <Code>{eventID}</Code>
                        </DataList.ItemValue>
                    </DataList.Item>

                    <DataList.Item>
                        <DataList.ItemLabel>Posted By</DataList.ItemLabel>
                        <DataList.ItemValue>
                            {lastName}, {firstName} (<Code>{accountID}</Code>)
                        </DataList.ItemValue>
                    </DataList.Item>

                    <DataList.Item>
                        <DataList.ItemLabel>Created At</DataList.ItemLabel>
                        <DataList.ItemValue>
                            <DatetimeText
                                detail="long"
                                timestamp={createdAtTimestamp}
                            />
                        </DataList.ItemValue>
                    </DataList.Item>

                    <DataList.Item>
                        <DataList.ItemLabel>Updated At</DataList.ItemLabel>
                        <DataList.ItemValue>
                            <DatetimeText
                                detail="long"
                                timestamp={updatedAtTimestamp}
                            />
                        </DataList.ItemValue>
                    </DataList.Item>

                    <DataList.Item>
                        <DataList.ItemLabel>Published At</DataList.ItemLabel>
                        <DataList.ItemValue>
                            {publishedAtTimestamp ? (
                                <DatetimeText
                                    detail="long"
                                    timestamp={publishedAtTimestamp}
                                />
                            ) : (
                                "-"
                            )}
                        </DataList.ItemValue>
                    </DataList.Item>
                </DataList.Root>
            </SectionCard.Body>

            <SectionCard.Footer>
                <IconButton
                    colorPalette="green"
                    display={state === "STATE_PUBLISHED" ? undefined : "none"}
                    onClick={onCopyClick}
                >
                    <CopyIcon />
                </IconButton>

                <Button
                    colorPalette="blue"
                    flexGrow="1"
                    display={state === "STATE_PUBLISHED" ? undefined : "none"}
                    asChild
                >
                    <a href={href} target="_blank">
                        Permalink
                        <LinkIcon />
                    </a>
                </Button>

                <Button
                    disabled={isDeleteEventDisabled}
                    colorPalette="red"
                    flexGrow="1"
                    onClick={onDeleteClick}
                >
                    Delete
                    <TrashIcon />
                </Button>
            </SectionCard.Footer>
        </SectionCard.Root>
    );
}

function EventTitle() {
    const {event} = useLoaderData<typeof loader>();

    const {title} = event;

    const titleUpdateFetcher = useFetcher();
    const {displayToast} = useToastsContext();

    const isTitleUpdateFetcherIdle = titleUpdateFetcher.state === "idle";
    const isTitleUpdateDisabled = !isTitleUpdateFetcherIdle;

    const onTitleChange = useCallback(
        (async (details) => {
            const {value} = details;

            if (title === value) {
                return;
            }

            await titleUpdateFetcher.submit(
                {
                    action: "title.update",
                    title: value,
                } satisfies IActionFormDataSchema,

                {
                    method: "POST",
                },
            );

            displayToast({
                status: TOAST_STATUS.success,
                title: `Updated the event's title`,
            });
        }) satisfies (details: EditableValueChangeDetails) => Promise<void>,

        [displayToast, title, titleUpdateFetcher],
    );

    const onValidateTitle = useCallback(
        ((details) => {
            const {value} = details;
            const {success} = v.safeParse(UX_TITLE_SCHEMA, value);

            return success;
        }) satisfies (details: EditableValueChangeDetails) => boolean,

        [],
    );

    return (
        <Title.Editable
            disabled={isTitleUpdateDisabled}
            title={title}
            maxLength={64}
            onCommit={onTitleChange}
            onValidate={onValidateTitle}
        />
    );
}

export default function AdminCalendarEvent(_props: Route.ComponentProps) {
    return (
        <Layout.FixedContainer>
            <EventTitle />

            <HStack gap="inherit" alignItems="stretch" blockSize="xs">
                <OverviewCard />
                <SettingsCard />
            </HStack>

            <ContentCard />
        </Layout.FixedContainer>
    );
}
