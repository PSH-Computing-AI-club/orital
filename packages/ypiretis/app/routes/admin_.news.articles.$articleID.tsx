import {Button, Code, DataList, Spacer} from "@chakra-ui/react";

import type {MouseEventHandler} from "react";
import {useCallback, useState} from "react";

import {data, useLoaderData, useFetcher} from "react-router";

import * as v from "valibot";

import {
    findOneByArticleID,
    updateOneByArticleID,
} from "~/.server/services/articles_service";
import {requireAuthenticatedSession} from "~/.server/services/users_service";

import {formatZonedDateTime} from "~/.server/utils/locale";
import {SYSTEM_TIMEZONE} from "~/.server/utils/temporal";

import Links from "~/components/common/links";
import type {IChangeCallback} from "~/components/common/markdown_editor";
import MarkdownEditor from "~/components/common/markdown_editor";

import Layout from "~/components/controlpanel/layout";
import SectionCard from "~/components/controlpanel/section_card";
import Title from "~/components/controlpanel/title";

import ArticleIcon from "~/components/icons/article_icon";
import InfoBoxIcon from "~/components/icons/info_box_icon";

import {validateFormData, validateParams} from "~/guards/validation";

import {buildAppURL} from "~/utils/url";

import {Route} from "./+types/admin_.news.articles.$articleID";

const CONTENT_UPDATE_ACTION_FORM_DATA_SCHEMA = v.object({
    action: v.pipe(v.string(), v.literal("content.update")),

    content: v.pipe(v.string()),
});

const ACTION_FORM_DATA_SCHEMA = v.variant("action", [
    CONTENT_UPDATE_ACTION_FORM_DATA_SCHEMA,
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

    const {identifiable: user} = await requireAuthenticatedSession(actionArgs);
    const {isAdmin} = user;

    if (!isAdmin) {
        throw data("Unauthorized", {
            status: 401,
        });
    }

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

    const updatedAtText = formatZonedDateTime(zonedUpdatedAt);

    return {
        article: {
            articleID,
            content,
            createdAtText,
            publishedAtText,
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

function DetailsCard() {
    const {article, poster} = useLoaderData<typeof loader>();

    const {articleID, createdAtText, publishedAtText, state, updatedAtText} =
        article;
    const {accountID, firstName, lastName} = poster;

    const href = `/news/articles/${articleID}`;
    const url = buildAppURL(href);

    return (
        <SectionCard.Root>
            <SectionCard.Body>
                <SectionCard.Title>
                    Details
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
                        <DataList.ItemValue>
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

            <SectionCard.Footer>
                <Spacer />
                <Button
                    disabled={isContentUpdateDisabled}
                    colorPalette="green"
                    onClick={onContentUpdateClick}
                >
                    Update Content
                </Button>
            </SectionCard.Footer>
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

            <DetailsCard />
            <ContentCard />
        </Layout.FixedContainer>
    );
}
