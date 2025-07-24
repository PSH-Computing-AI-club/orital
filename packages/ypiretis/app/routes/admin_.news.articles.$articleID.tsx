import {Temporal} from "@js-temporal/polyfill";

import type {
    SegmentGroupValueChangeDetails,
    RadioCardValueChangeDetails,
} from "@chakra-ui/react";
import {
    Button,
    Code,
    DataList,
    Field,
    HStack,
    Icon,
    Input,
    RadioCard,
    SegmentGroup,
    Spacer,
} from "@chakra-ui/react";

import type {FormEventHandler, MouseEventHandler} from "react";
import {useCallback, useState} from "react";

import {data, useLoaderData, useFetcher} from "react-router";

import * as v from "valibot";

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
import SectionCard from "~/components/controlpanel/section_card";
import Title from "~/components/controlpanel/title";

import ArticleIcon from "~/components/icons/article_icon";
import EyeIcon from "~/components/icons/eye_icon";
import EyeClosedIcon from "~/components/icons/eye_closed_icon";
import InfoBoxIcon from "~/components/icons/info_box_icon";
import SlidersIcon from "~/components/icons/sliders_icon";

import {validateFormData, validateParams} from "~/guards/validation";

import {toLocalISOString} from "~/utils/datetime";
import {buildAppURL} from "~/utils/url";

import {Route} from "./+types/admin_.news.articles.$articleID";

const CONTENT_UPDATE_ACTION_FORM_DATA_SCHEMA = v.object({
    action: v.pipe(v.string(), v.literal("content.update")),

    content: v.pipe(v.string()),
});

const STATE_UPDATE_ACTION_FORM_DATA_SCHEMA = v.object({
    action: v.pipe(v.string(), v.literal("state.update")),

    state: v.pipe(
        v.string(),
        v.picklist([ARTICLE_STATES.draft, ARTICLE_STATES.published]),
    ),
});

const PUBLISHED_AT_UPDATE_ACTION_FORM_DATA_SCHEMA = v.object({
    action: v.pipe(v.string(), v.literal("publishedAt.update")),

    publishedAtTimestamp: v.pipe(
        v.string(),
        v.transform((value) => Number(value)),
        v.number(),
    ),
});

const ACTION_FORM_DATA_SCHEMA = v.variant("action", [
    CONTENT_UPDATE_ACTION_FORM_DATA_SCHEMA,
    PUBLISHED_AT_UPDATE_ACTION_FORM_DATA_SCHEMA,
    STATE_UPDATE_ACTION_FORM_DATA_SCHEMA,
]);

const ACTION_PARAMS_SCHEMA = v.object({
    articleID: v.pipe(v.string(), v.ulid()),
});

const LOADER_PARAMS_SCHEMA = v.object({
    articleID: v.pipe(v.string(), v.ulid()),
});

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

    const publishedAtTimestamp = publishedAt?.epochMilliseconds;

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

function matchSettingsCardView(view: "actions" | "publishing" | "uploads") {
    switch (view) {
        case "actions":
            return SettingsCardActionsView;

        case "publishing":
            return SettingsCardPublishingView;

        case "uploads":
            return SettingsCardUploadsView;
    }
}

function SettingsCardActionsView() {
    return <>settings card actions view unda construction</>;
}

function SettingsCardPublishingView() {
    const {article} = useLoaderData<typeof loader>();

    const {publishedAtTimestamp, state} = article;

    const stateUpdateFetcher = useFetcher();
    const publishedAtUpdateFetcher = useFetcher();

    const onStateChange = useCallback(
        (async (details) => {
            const {value} = details;

            await stateUpdateFetcher.submit(
                {
                    action: "state.update",
                    state: value as "STATE_DRAFT" | "STATE_PUBLISHED",
                } satisfies IActionFormDataSchema,

                {
                    method: "POST",
                },
            );
        }) satisfies (details: RadioCardValueChangeDetails) => Promise<void>,

        [stateUpdateFetcher],
    );

    const onPublishedAtChange = useCallback(
        (async (event) => {
            const {target} = event;
            const {value} = target as HTMLInputElement;

            const newLocalPublishedAt = new Date(value);
            const newPublishedAtTimestamp = newLocalPublishedAt.getTime();

            await publishedAtUpdateFetcher.submit(
                {
                    action: "publishedAt.update",
                    publishedAtTimestamp: newPublishedAtTimestamp,
                } satisfies IActionFormDataSchema,

                {
                    method: "POST",
                },
            );
        }) satisfies FormEventHandler<HTMLInputElement>,

        [publishedAtUpdateFetcher],
    );

    const isDraft = state === "STATE_DRAFT";
    const isPublished = state === "STATE_PUBLISHED";

    const isStateUpdateFetcherIdle = stateUpdateFetcher.state === "idle";
    const isPublishedAtUpdateFetcherIdle =
        publishedAtUpdateFetcher.state === "idle";

    const canDraft = isStateUpdateFetcherIdle && !isDraft;
    const canPublish = isStateUpdateFetcherIdle && !isPublished;

    const isStateUpdateDisabled = !isStateUpdateFetcherIdle;
    const isPublishedAtUpdateDisabled = !isPublishedAtUpdateFetcherIdle;

    const localPublishedAt = publishedAtTimestamp
        ? new Date(publishedAtTimestamp)
        : null;

    const localPublishedAtDateTime = localPublishedAt
        ? toLocalISOString(localPublishedAt)
        : null;

    return (
        <>
            <RadioCard.Root
                variant="surface"
                orientation="vertical"
                align="center"
                value={state}
                onValueChange={onStateChange}
            >
                <RadioCard.Label>Publishing State</RadioCard.Label>

                <HStack justifyContent="stretch">
                    <RadioCard.Item
                        disabled={isStateUpdateDisabled}
                        value="STATE_DRAFT"
                        colorPalette="red"
                        cursor={canDraft ? "pointer" : "disabled"}
                    >
                        <RadioCard.ItemHiddenInput />

                        <RadioCard.ItemControl>
                            <Icon fontSize="2xl">
                                <EyeClosedIcon />
                            </Icon>

                            <RadioCard.ItemText>Draft</RadioCard.ItemText>
                        </RadioCard.ItemControl>
                    </RadioCard.Item>

                    <RadioCard.Item
                        disabled={isStateUpdateDisabled}
                        value="STATE_PUBLISHED"
                        colorPalette="green"
                        cursor={canPublish ? "pointer" : "disabled"}
                    >
                        <RadioCard.ItemHiddenInput />

                        <RadioCard.ItemControl>
                            <Icon fontSize="2xl">
                                <EyeIcon />
                            </Icon>

                            <RadioCard.ItemText>Published</RadioCard.ItemText>
                        </RadioCard.ItemControl>
                    </RadioCard.Item>
                </HStack>
            </RadioCard.Root>

            {localPublishedAtDateTime ? (
                <Field.Root>
                    <Field.Label>Published At</Field.Label>

                    <Input
                        disabled={isPublishedAtUpdateDisabled}
                        type="datetime-local"
                        value={localPublishedAtDateTime}
                        onChange={onPublishedAtChange}
                    />
                </Field.Root>
            ) : undefined}
        </>
    );
}

function SettingsCardUploadsView() {
    return <>settings card uploads view unda construction</>;
}

function SettingsCard() {
    const [selectedView, setSelectedView] = useState<
        "actions" | "publishing" | "uploads"
    >("actions");

    const onViewSelected = useCallback(
        ((details) => {
            const {value} = details;

            setSelectedView(value as "actions" | "publishing" | "uploads");
        }) satisfies (details: SegmentGroupValueChangeDetails) => void,

        [setSelectedView],
    );

    const SelectedView = matchSettingsCardView(selectedView);

    return (
        <SectionCard.Root flexGrow="1">
            <SectionCard.Body>
                <SectionCard.Title>
                    Settings
                    <Spacer />
                    <SegmentGroup.Root
                        value={selectedView}
                        size="sm"
                        fontWeight="normal"
                        onValueChange={onViewSelected}
                    >
                        <SegmentGroup.Indicator bg="bg" />

                        <SegmentGroup.Item value="actions">
                            <SegmentGroup.ItemText
                                color={
                                    selectedView === "actions"
                                        ? "cyan.fg"
                                        : undefined
                                }
                            >
                                Actions
                            </SegmentGroup.ItemText>
                            <SegmentGroup.ItemHiddenInput />
                        </SegmentGroup.Item>

                        <SegmentGroup.Item value="publishing">
                            <SegmentGroup.ItemText
                                color={
                                    selectedView === "publishing"
                                        ? "cyan.fg"
                                        : undefined
                                }
                            >
                                Publishing
                            </SegmentGroup.ItemText>
                            <SegmentGroup.ItemHiddenInput />
                        </SegmentGroup.Item>

                        <SegmentGroup.Item value="uploads">
                            <SegmentGroup.ItemText
                                color={
                                    selectedView === "uploads"
                                        ? "cyan.fg"
                                        : undefined
                                }
                            >
                                Uploads
                            </SegmentGroup.ItemText>
                            <SegmentGroup.ItemHiddenInput />
                        </SegmentGroup.Item>
                    </SegmentGroup.Root>
                    <SlidersIcon />
                </SectionCard.Title>
                <SelectedView />
            </SectionCard.Body>
        </SectionCard.Root>
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
                        <DataList.ItemValue>{articleID}</DataList.ItemValue>
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

export default function AdminNewsArticle(props: Route.ComponentProps) {
    const {loaderData} = props;
    const {article} = loaderData;

    const {title} = article;

    return (
        <Layout.FixedContainer>
            <Title.Text title={title} />

            <HStack alignItems="stretch">
                <OverviewCard />
                <SettingsCard />
            </HStack>

            <ContentCard />
        </Layout.FixedContainer>
    );
}
