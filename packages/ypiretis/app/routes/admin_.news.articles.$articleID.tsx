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
    Input,
    Spacer,
} from "@chakra-ui/react";

import {Temporal} from "@js-temporal/polyfill";

import {format} from "bytes";

import type {FormEventHandler, MouseEventHandler} from "react";
import {useCallback, useEffect, useMemo, useRef, useState} from "react";

import {data, useFetcher, useLoaderData, useRevalidator} from "react-router";

import * as v from "valibot";

import type {IArticleStates} from "~/.server/services/articles_service";
import {
    ARTICLE_STATES,
    findOne as findOneArticle,
    findOneWithPoster as findOneArticleWithPoster,
    findAllAttachmentsByID,
    deleteOneAttachment,
    updateOne,
} from "~/.server/services/articles_service";
import {eq} from "~/.server/services/crud_service.filters";
import {findOne as findOneUpload} from "~/.server/services/uploads_service";
import {requireAuthenticatedAdminSession} from "~/.server/services/users_service";

import {formatZonedDateTime} from "~/.server/utils/locale";
import {SYSTEM_TIMEZONE} from "~/.server/utils/temporal";
import {ulid} from "~/.server/utils/valibot";

import Links from "~/components/common/links";
import type {IChangeCallback} from "~/components/common/markdown_editor";
import MarkdownEditor from "~/components/common/markdown_editor";

import ListTile from "~/components/controlpanel/list_tile";
import Layout from "~/components/controlpanel/layout";
import RadioCardGroup from "~/components/controlpanel/radio_card_group";
import SectionCard from "~/components/controlpanel/section_card";
import TabbedSectionCard from "~/components/controlpanel/tabbed_section_card";
import Title from "~/components/controlpanel/title";
import type {
    IFileUploadCallback,
    IFileUploadCompleteCallback,
    IFileUploadLike,
    IRenderCompletedFileUploadActions,
} from "~/components/controlpanel/file_upload_dropbox";
import FileUploadDropbox from "~/components/controlpanel/file_upload_dropbox";

import ArticleIcon from "~/components/icons/article_icon";
import CloseIcon from "~/components/icons/close_icon";
import CopyIcon from "~/components/icons/copy_icon";
import DownloadIcon from "~/components/icons/download_icon";
import EyeIcon from "~/components/icons/eye_icon";
import EyeClosedIcon from "~/components/icons/eye_closed_icon";
import InfoBoxIcon from "~/components/icons/info_box_icon";
import LinkIcon from "~/components/icons/link_icon";
import SlidersIcon from "~/components/icons/sliders_icon";

import {validateFormData, validateParams} from "~/guards/validation";

import {ARTICLES_ATTACHMENTS_MAX_FILE_SIZE} from "~/utils/constants";
import {toLocalISOString} from "~/utils/datetime";
import {buildFormData} from "~/utils/forms";
import {buildAppURL} from "~/utils/url";
import {number, title} from "~/utils/valibot";

import type {IActionFormData as IUploadActionFormData} from "./admin_.news_.articles_.$articleID_.actions_.upload";

import {Route} from "./+types/admin_.news.articles.$articleID";

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
            // **TODO:** This whole action could be done efficient with more
            // streamlined interactions with the database. But, this is an
            // admin panel interaction. We do no need to be _that_ efficient.

            const {uploadID} = actionFormData;

            const [article, upload] = await Promise.all([
                findOneArticle({
                    where: eq("articleID", articleID),
                }),
                findOneUpload({
                    where: eq("uploadID", uploadID),
                }),
            ]);

            if (article === null || upload === null) {
                throw data("Not Found", {
                    status: 404,
                });
            }

            const {id: internalArticleID} = article;
            const {id: internalUploadID} = upload;

            try {
                await deleteOneAttachment(internalArticleID, internalUploadID);
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
            const {content} = actionFormData;

            const article = await updateOne({
                where: eq("articleID", articleID),

                values: {
                    content,
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

    const attachments = (await findAllAttachmentsByID(internalID)).map(
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

function ContentCard() {
    const {article} = useLoaderData<typeof loader>();

    const {content: loaderContent} = article;

    const contentUpdateFetcher = useFetcher();
    const [liveContent, setLiveContent] = useState<string>(loaderContent);

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
        }) satisfies MouseEventHandler<HTMLButtonElement>,

        [contentUpdateFetcher, liveContent],
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
    const {revalidate} = useRevalidator();

    const {articleID} = article;

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

    const onFileUploadComplete = useCallback(
        (() => {
            revalidate();
        }) satisfies IFileUploadCompleteCallback,

        [revalidate],
    );

    const renderCompletedFileUploadActions = useCallback(
        ((file) => {
            const {id, name} = file;

            const downloadURL = `/uploads/${id}/${name}?forceDownload=true`;
            const embedURL = `/uploads/${id}/${name}`;

            const copyURL = buildAppURL(embedURL);

            const onCopyClick = (async (_event) => {
                await navigator.clipboard.writeText(copyURL.toString());
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

                    <ListTile.IconButton colorPalette="blue" asChild>
                        <a href={embedURL} target="_blank">
                            <LinkIcon />
                        </a>
                    </ListTile.IconButton>

                    <ListTile.IconButton colorPalette="red">
                        <CloseIcon />
                    </ListTile.IconButton>
                </>
            );
        }) satisfies IRenderCompletedFileUploadActions,

        [],
    );

    return (
        <TabbedSectionCard.View label="Attachments">
            <FileUploadDropbox
                completedFileUploads={completeFileUploads}
                helpText={`max file size ${MAX_FILE_SIZE_TEXT}`}
                blockSize="full"
                onFileUpload={onFileUpload}
                onFileUploadComplete={onFileUploadComplete}
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
            const {value} = details;

            await stateUpdateFetcher.submit(
                {
                    action: "state.update",
                    state: value as IArticleStates,
                } satisfies IActionFormDataSchema,

                {
                    method: "POST",
                },
            );
        }) satisfies (details: RadioCardValueChangeDetails) => Promise<void>,

        [stateUpdateFetcher],
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
        }) satisfies MouseEventHandler<HTMLButtonElement>,

        [liveLocalPublishedAt, publishedAtUpdateFetcher],
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

function SettingsCardActionsView() {
    return (
        <TabbedSectionCard.View label="Actions">
            settings card actions view unda construction
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

                <SettingsCardActionsView />
                <SettingsCardPublishingView />
                <SettingsCardAttachmentsView />
            </TabbedSectionCard.Body>
        </TabbedSectionCard.Root>
    );
}

function OverviewCard() {
    const {article, poster} = useLoaderData<typeof loader>();

    const {articleID, createdAtText, publishedAtText, state, updatedAtText} =
        article;
    const {accountID, firstName, lastName} = poster;

    const href = `/news/articles/${articleID}`;
    const url = buildAppURL(href);

    return (
        <SectionCard.Root inlineSize="xl">
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

                    <DataList.Item>
                        <DataList.ItemLabel>Permalink</DataList.ItemLabel>
                        <DataList.ItemValue blockSize="9">
                            {state === "STATE_PUBLISHED" ? (
                                <Code>
                                    <Links.InternalLink to={href}>
                                        {url.toString()}
                                    </Links.InternalLink>
                                </Code>
                            ) : (
                                "-"
                            )}
                        </DataList.ItemValue>
                    </DataList.Item>
                </DataList.Root>
            </SectionCard.Body>
        </SectionCard.Root>
    );
}

function ArticleTitle() {
    const {article} = useLoaderData<typeof loader>();

    const {title} = article;

    const titleUpdateFetcher = useFetcher();

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
        }) satisfies (details: EditableValueChangeDetails) => Promise<void>,

        [title, titleUpdateFetcher],
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
