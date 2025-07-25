import {Temporal} from "@js-temporal/polyfill";

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

import type {FormEventHandler, MouseEventHandler} from "react";
import {useCallback, useEffect, useRef, useState} from "react";

import {data, useLoaderData, useFetcher} from "react-router";

import * as v from "valibot";

import type {IArticleStates} from "~/.server/database/tables/articles_table";
import {
    ARTICLE_STATES,
    findOneByArticleID,
    updateOneByArticleID,
} from "~/.server/services/articles_service";
import {requireAuthenticatedAdminSession} from "~/.server/services/users_service";

import {formatZonedDateTime} from "~/.server/utils/locale";
import {SYSTEM_TIMEZONE} from "~/.server/utils/temporal";

import Links from "~/components/common/links";
import type {IChangeCallback} from "~/components/common/markdown_editor";
import MarkdownEditor from "~/components/common/markdown_editor";

import Layout from "~/components/controlpanel/layout";
import RadioCardGroup from "~/components/controlpanel/radio_card_group";
import SectionCard from "~/components/controlpanel/section_card";
import TabbedSectionCard from "~/components/controlpanel/tabbed_section_card";
import Title from "~/components/controlpanel/title";

import ArticleIcon from "~/components/icons/article_icon";
import EyeIcon from "~/components/icons/eye_icon";
import EyeClosedIcon from "~/components/icons/eye_closed_icon";
import InfoBoxIcon from "~/components/icons/info_box_icon";
import SlidersIcon from "~/components/icons/sliders_icon";

import {validateFormData, validateParams} from "~/guards/validation";

import {toLocalISOString} from "~/utils/datetime";
import {buildAppURL} from "~/utils/url";
import {title} from "~/utils/valibot";

import {Route} from "./+types/admin_.news.articles.$articleID";

const CONTENT_UPDATE_ACTION_FORM_DATA_SCHEMA = v.object({
    action: v.pipe(v.string(), v.literal("content.update")),

    content: v.pipe(v.string()),
});

const PUBLISHED_AT_UPDATE_ACTION_FORM_DATA_SCHEMA = v.object({
    action: v.pipe(v.string(), v.literal("publishedAt.update")),

    publishedAtTimestamp: v.pipe(
        v.string(),
        v.transform((value) => Number(value)),
        v.number(),
    ),
});

const STATE_UPDATE_ACTION_FORM_DATA_SCHEMA = v.object({
    action: v.pipe(v.string(), v.literal("state.update")),

    state: v.pipe(
        v.string(),
        v.picklist([ARTICLE_STATES.draft, ARTICLE_STATES.published]),
    ),
});

const TITLE_UPDATE_ACTION_FORM_DATA_SCHEMA = v.object({
    action: v.pipe(v.string(), v.literal("title.update")),

    title: v.pipe(v.string(), v.nonEmpty(), v.maxLength(64), title),
});

const ACTION_FORM_DATA_SCHEMA = v.variant("action", [
    CONTENT_UPDATE_ACTION_FORM_DATA_SCHEMA,
    PUBLISHED_AT_UPDATE_ACTION_FORM_DATA_SCHEMA,
    STATE_UPDATE_ACTION_FORM_DATA_SCHEMA,
    TITLE_UPDATE_ACTION_FORM_DATA_SCHEMA,
]);

const ACTION_PARAMS_SCHEMA = v.object({
    articleID: v.pipe(v.string(), v.ulid()),
});

const LOADER_PARAMS_SCHEMA = v.object({
    articleID: v.pipe(v.string(), v.ulid()),
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
        case "content.update": {
            const {content} = actionFormData;

            try {
                await updateOneByArticleID(articleID, {
                    content,
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

        case "publishedAt.update": {
            const {publishedAtTimestamp} = actionFormData;

            const publishedAt =
                Temporal.Instant.fromEpochMilliseconds(publishedAtTimestamp);

            try {
                await updateOneByArticleID(articleID, {
                    publishedAt,
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

        case "state.update": {
            const {state} = actionFormData;

            try {
                const publishedAt =
                    state === ARTICLE_STATES.draft
                        ? null
                        : Temporal.Now.instant();

                await updateOneByArticleID(articleID, {
                    publishedAt,
                    state,
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

        case "title.update": {
            const {title} = actionFormData;

            try {
                await updateOneByArticleID(articleID, {
                    title,
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
    }
}

export async function loader(loaderArgs: Route.LoaderArgs) {
    const {articleID} = validateParams(LOADER_PARAMS_SCHEMA, loaderArgs);

    const article = await findOneByArticleID(articleID);

    if (article === null) {
        throw data("Not Found", {
            status: 404,
        });
    }

    const {content, createdAt, poster, publishedAt, state, title, updatedAt} =
        article;
    const {accountID, firstName, lastName} = poster;

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

function SettingsCardActionsView() {
    return (
        <TabbedSectionCard.View label="Actions">
            settings card actions view unda construction
        </TabbedSectionCard.View>
    );
}

function SettingsCardPublishingView() {
    const {article} = useLoaderData<typeof loader>();

    const publishedAtInputRef = useRef<HTMLInputElement | null>(null);

    const {publishedAtTimestamp, state} = article;

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

function SettingsCardUploadsView() {
    return (
        <TabbedSectionCard.View label="Uploads">
            settings card uploads view unda construction
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
                <SettingsCardUploadsView />
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

            <HStack gap="inherit" alignItems="stretch">
                <OverviewCard />
                <SettingsCard />
            </HStack>

            <ContentCard />
        </Layout.FixedContainer>
    );
}
