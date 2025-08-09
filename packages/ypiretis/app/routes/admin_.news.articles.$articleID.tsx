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
import {useCallback, useEffect, useMemo, useRef, useState} from "react";

import {
    data,
    redirect,
    useFetcher,
    useLoaderData,
    useRevalidator,
} from "react-router";

import * as v from "valibot";

import type {IArticleStates} from "~/.server/services/articles_service";
import {
    ARTICLE_STATES,
    deleteOne as deleteOneArticle,
    deleteAllAttachmentsByID as deleteAllArticleAttachmentsByID,
    deleteOneAttachmentByIDs as deleteOneArticleAttachmentByIDs,
    findOneWithPoster as findOneArticleWithPoster,
    findAllAttachmentsByInternalID as findAllArticleAttachmentsByInternalID,
    updateOne,
} from "~/.server/services/articles_service";
import {eq} from "~/.server/services/crud_service.filters";
import {formatMarkdown} from "~/.server/services/markdown";
import {requireAuthenticatedAdminSession} from "~/.server/services/users_service";

import {createTransaction} from "~/.server/state/transaction";

import {formatZonedDateTime} from "~/.server/utils/locale";
import {SYSTEM_TIMEZONE} from "~/.server/utils/temporal";
import {ulid} from "~/.server/utils/valibot";

import type {IChangeCallback} from "~/components/common/markdown_editor";
import MarkdownEditor from "~/components/common/markdown_editor";

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
import RadioCardGroup from "~/components/controlpanel/radio_card_group";
import SectionCard from "~/components/controlpanel/section_card";
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

import {ARTICLES_ATTACHMENTS_MAX_FILE_SIZE} from "~/utils/constants";
import {toLocalISOString} from "~/utils/datetime";
import {buildFormData} from "~/utils/forms";
import {truncateTextMiddle} from "~/utils/string";
import {buildAppURL} from "~/utils/url";
import {number, title} from "~/utils/valibot";

import type {IActionFormData as IUploadActionFormData} from "./admin_.news_.articles_.$articleID_.actions_.upload";

import {Route} from "./+types/admin_.news.articles.$articleID";

const FILE_NAME_MAX_LENGTH = 52;

const MAX_FILE_SIZE_TEXT = format(ARTICLES_ATTACHMENTS_MAX_FILE_SIZE, {
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

const PUBLISHED_AT_UPDATE_ACTION_FORM_DATA_SCHEMA = v.object({
    action: v.literal("publishedAt.update"),

    publishedAtTimestamp: number,
});

const SELF_DELETE_ACTION_FORM_DATA_SCHEMA = v.object({
    action: v.literal("self.delete"),
});

const STATE_UPDATE_ACTION_FORM_DATA_SCHEMA = v.object({
    action: v.literal("state.update"),

    state: v.pipe(
        v.string(),
        v.picklist([ARTICLE_STATES.draft, ARTICLE_STATES.published]),
    ),
});

const TITLE_UPDATE_ACTION_FORM_DATA_SCHEMA = v.object({
    action: v.literal("title.update"),

    title: v.pipe(v.string(), v.nonEmpty(), v.maxLength(64), title),
});

const ACTION_FORM_DATA_SCHEMA = v.variant("action", [
    ATTACHMENT_DELETE_ACTION_FORM_DATA_SCHEMA,
    CONTENT_UPDATE_ACTION_FORM_DATA_SCHEMA,
    PUBLISHED_AT_UPDATE_ACTION_FORM_DATA_SCHEMA,
    SELF_DELETE_ACTION_FORM_DATA_SCHEMA,
    STATE_UPDATE_ACTION_FORM_DATA_SCHEMA,
    TITLE_UPDATE_ACTION_FORM_DATA_SCHEMA,
]);

const ACTION_PARAMS_SCHEMA = v.object({
    articleID: ulid,
});

const LOADER_PARAMS_SCHEMA = v.object({
    articleID: ulid,
});

const UX_TITLE_SCHEMA = v.pipe(
    v.string(),
    v.nonEmpty(),
    v.maxLength(64),
    title,
);

type IActionFormDataSchema = v.InferOutput<typeof ACTION_FORM_DATA_SCHEMA>;

export async function action(actionArgs: Route.ActionArgs) {
    const {articleID} = validateParams(ACTION_PARAMS_SCHEMA, actionArgs);

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
                    return deleteOneArticleAttachmentByIDs(articleID, uploadID);
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

            const article = await updateOne({
                where: eq("articleID", articleID),

                values: {
                    content: formattedContent,
                },
            });

            if (article === null) {
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

            const article = await updateOne({
                where: eq("articleID", articleID),

                values: {
                    publishedAt,
                },
            });

            if (article === null) {
                throw data("Not Found", {
                    status: 404,
                });
            }

            break;
        }

        case "self.delete": {
            try {
                await createTransaction(async () => {
                    await deleteAllArticleAttachmentsByID(articleID);

                    return deleteOneArticle({
                        where: eq("articleID", articleID),
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

        case "state.update": {
            const {state} = actionFormData;

            const publishedAt =
                state === ARTICLE_STATES.draft ? null : Temporal.Now.instant();

            const article = await updateOne({
                where: eq("articleID", articleID),

                values: {
                    publishedAt,
                    state,
                },
            });

            if (article === null) {
                throw data("Not Found", {
                    status: 404,
                });
            }

            break;
        }

        case "title.update": {
            const {title} = actionFormData;

            const article = await updateOne({
                where: eq("articleID", articleID),

                values: {
                    title,
                },
            });

            if (article === null) {
                throw data("Not Found", {
                    status: 404,
                });
            }

            break;
        }
    }
}

export async function loader(loaderArgs: Route.LoaderArgs) {
    const {articleID} = validateParams(LOADER_PARAMS_SCHEMA, loaderArgs);

    const article = await findOneArticleWithPoster({
        where: eq("articleID", articleID),
    });

    if (article === null) {
        throw data("Not Found", {
            status: 404,
        });
    }

    const {
        content,
        createdAt,
        id: internalID,
        poster,
        publishedAt,
        state,
        title,
        updatedAt,
    } = article;
    const {accountID, firstName, lastName} = poster;

    const attachments = (
        await findAllArticleAttachmentsByInternalID(internalID)
    ).map((upload) => {
        const {fileName, fileSize, mimeType, uploadID} = upload;

        return {
            fileName,
            fileSize,
            mimeType,
            uploadID,
        };
    });

    const zonedCreatedAt = createdAt.toZonedDateTimeISO(SYSTEM_TIMEZONE);

    const zonedPublishedAt =
        publishedAt?.toZonedDateTimeISO(SYSTEM_TIMEZONE) ?? null;

    const zonedUpdatedAt = updatedAt.toZonedDateTimeISO(SYSTEM_TIMEZONE);

    const createdAtText = formatZonedDateTime(zonedCreatedAt);

    const publishedAtText = zonedPublishedAt
        ? formatZonedDateTime(zonedPublishedAt)
        : null;

    const publishedAtTimestamp = publishedAt?.epochMilliseconds ?? null;

    const updatedAtText = formatZonedDateTime(zonedUpdatedAt);

    return {
        attachments,

        article: {
            articleID,
            content,
            createdAtText,
            publishedAtText,
            publishedAtTimestamp,
            state,
            title,
            updatedAtText,
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
    const {article} = useLoaderData<typeof loader>();

    const {content: loaderContent} = article;

    const contentUpdateFetcher = useFetcher();
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

            displayToast({
                status: TOAST_STATUS.success,
                title: "Updated article's content",
            });
        }) satisfies MouseEventHandler<HTMLButtonElement>,

        [contentUpdateFetcher, liveContent, displayToast],
    );

    const onMarkdownChange = useCallback(
        ((markdown, initialMarkdownNormalize) => {
            if (initialMarkdownNormalize) {
                return;
            }

            setLiveContent(markdown);
        }) satisfies IChangeCallback,

        [setLiveContent],
    );

    const isLiveContentDirty = liveContent !== loaderContent;
    const isContentUpdateFetcherIdle = contentUpdateFetcher.state === "idle";

    const isContentUpdateDisabled =
        !isContentUpdateFetcherIdle || !isLiveContentDirty;

    return (
        <SectionCard.Root flexGrow="1">
            <SectionCard.Body>
                <SectionCard.Title>
                    Content
                    <Spacer />
                    <Button
                        disabled={isContentUpdateDisabled}
                        colorPalette="green"
                        size="sm"
                        onClick={onContentUpdateClick}
                    >
                        Update Content
                    </Button>
                    <ArticleIcon />
                </SectionCard.Title>

                <MarkdownEditor
                    markdown={loaderContent}
                    flexGrow="1"
                    height="0"
                    overflowX="hidden"
                    overflowY="auto"
                    onMarkdownChange={onMarkdownChange}
                />
            </SectionCard.Body>
        </SectionCard.Root>
    );
}

function SettingsCardAttachmentsView() {
    const {attachments, article} = useLoaderData<typeof loader>();

    const deleteFetcher = useFetcher();
    const {revalidate} = useRevalidator();
    const {displayToast} = useToastsContext();

    const {articleID} = article;

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
                `/admin/news/articles/${articleID}/actions/upload`,
                {
                    method: "POST",

                    body: buildFormData<IUploadActionFormData>({
                        file,
                        action: "upload.file",
                    }),
                },
            );
        }) satisfies IFileUploadCallback,

        [articleID],
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
    const {article} = useLoaderData<typeof loader>();

    const {publishedAtTimestamp, state} = article;

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
            const {value} = details as {value: IArticleStates};

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
                title: `Updated the article to be ${value === "STATE_PUBLISHED" ? "published" : "hidden"}`,
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
                title: `Updated the article's publishing timestamp`,
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
                        value={"STATE_DRAFT" satisfies IArticleStates}
                        label="Draft"
                        icon={<EyeClosedIcon />}
                        colorPalette="red"
                    />

                    <RadioCardGroup.Option
                        value={"STATE_PUBLISHED" satisfies IArticleStates}
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

                <SettingsCardPublishingView />
                <SettingsCardAttachmentsView />
            </TabbedSectionCard.Body>
        </TabbedSectionCard.Root>
    );
}

function OverviewCard() {
    const {article, poster} = useLoaderData<typeof loader>();
    const {displayToast} = useToastsContext();

    const {articleID, createdAtText, publishedAtText, state, updatedAtText} =
        article;
    const {accountID, firstName, lastName} = poster;

    const deleteArticleFetcher = useFetcher();

    const href = `/news/articles/${articleID}`;
    const url = buildAppURL(href);

    const isDeleteArticleFetcherIdle = deleteArticleFetcher.state === "idle";
    const isDeleteArticleDisabled = !isDeleteArticleFetcherIdle;

    const onCopyClick = useCallback(
        (async (_event) => {
            await navigator.clipboard.writeText(url.toString());

            displayToast({
                status: TOAST_STATUS.success,
                title: "Copied the article's permalink URL to clipboard",
            });
        }) satisfies MouseEventHandler<HTMLButtonElement>,

        [displayToast, url],
    );

    const onDeleteClick = useCallback(
        (async (_event) => {
            const response = prompt(
                `Confirm that you want to delete this article by typing "DELETE" below`,
            )?.toLowerCase() as "delete" | string | null;

            switch (response) {
                case "delete":
                    await deleteArticleFetcher.submit(
                        {
                            action: "self.delete",
                        } satisfies IActionFormDataSchema,

                        {
                            method: "POST",
                        },
                    );

                    displayToast({
                        status: TOAST_STATUS.success,
                        title: "Deleted the article",
                    });

                    break;

                default:
                    displayToast({
                        status: TOAST_STATUS.warning,
                        title: "Article deletion was canceled",
                    });

                    break;
            }
        }) satisfies MouseEventHandler<HTMLButtonElement>,

        [deleteArticleFetcher, displayToast],
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
                        <DataList.ItemLabel>Article ID</DataList.ItemLabel>
                        <DataList.ItemValue>
                            <Code>{articleID}</Code>
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
                        <DataList.ItemValue>{createdAtText}</DataList.ItemValue>
                    </DataList.Item>

                    <DataList.Item>
                        <DataList.ItemLabel>Updated At</DataList.ItemLabel>
                        <DataList.ItemValue>{updatedAtText}</DataList.ItemValue>
                    </DataList.Item>

                    <DataList.Item>
                        <DataList.ItemLabel>Published At</DataList.ItemLabel>
                        <DataList.ItemValue>
                            {publishedAtText ?? "-"}
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
                    <a href={href}>
                        Permalink
                        <LinkIcon />
                    </a>
                </Button>

                <Button
                    disabled={isDeleteArticleDisabled}
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

function ArticleTitle() {
    const {article} = useLoaderData<typeof loader>();

    const {title} = article;

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
                title: `Updated the article's title`,
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

export default function AdminNewsArticle(_props: Route.ComponentProps) {
    return (
        <Layout.FixedContainer>
            <ArticleTitle />

            <HStack gap="inherit" alignItems="stretch" blockSize="xs">
                <OverviewCard />
                <SettingsCard />
            </HStack>

            <ContentCard />
        </Layout.FixedContainer>
    );
}
