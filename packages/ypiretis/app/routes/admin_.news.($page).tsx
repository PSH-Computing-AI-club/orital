import {Button, Code, IconButton, Spacer, Table} from "@chakra-ui/react";

import {
    Form,
    Link as RouterLink,
    data,
    redirect,
    useNavigation,
} from "react-router";

import * as v from "valibot";

import {
    ARTICLE_STATES,
    findAll,
    insertOne,
} from "~/.server/services/articles_service";
import {requireAuthenticatedAdminSession} from "~/.server/services/users_service";

import {formatZonedDateTime} from "~/.server/utils/locale";
import {SYSTEM_TIMEZONE} from "~/.server/utils/temporal";

import type {IPaginationTemplate} from "~/components/common/pagination";
import Pagination from "~/components/common/pagination";

import Layout from "~/components/controlpanel/layout";
import Title from "~/components/controlpanel/title";

import EditIcon from "~/components/icons/edit_icon";
import NotesPlusIcon from "~/components/icons/notes_plus_icon";

import {validateFormData, validateParams} from "~/guards/validation";

import {Route} from "./+types/admin_.news.($page)";

const ARTICLES_PER_PAGE = 25;

const PAGINATION_PAGE_RANGE = 3;

const PAGINATION_URL_TEMPLATE = (({page}) =>
    `/admin/news/${page}`) satisfies IPaginationTemplate;

const ACTION_FORM_DATA_SCHEMA = v.object({
    action: v.pipe(v.string(), v.picklist(["create"])),
});

const LOADER_PARAMS_SCHEMA = v.object({
    page: v.optional(
        v.pipe(
            v.string(),
            v.transform((value) => Number(value)),
            v.number(),
        ),
    ),
});

export async function action(actionArgs: Route.ActionArgs) {
    const {action} = await validateFormData(
        ACTION_FORM_DATA_SCHEMA,
        actionArgs,
    );

    const {identifiable: user} =
        await requireAuthenticatedAdminSession(actionArgs);

    const {id: userID} = user;

    switch (action) {
        case "create": {
            const {articleID} = await insertOne({
                content: "",
                posterUserID: userID,
                state: ARTICLE_STATES.draft,
                title: "Untitled Article",
            });

            return redirect(`/admin/news/articles/${articleID}`);
        }
    }
}

export async function loader(loaderArgs: Route.LoaderArgs) {
    const {page = 1} = validateParams(LOADER_PARAMS_SCHEMA, loaderArgs);

    const {articles, pagination} = await findAll({
        pagination: {
            page,

            limit: ARTICLES_PER_PAGE,
        },
    });

    const {pages} = pagination;

    if (page > pages) {
        throw data("Not Found", {
            status: 404,
        });
    }

    const mappedArticles = await Promise.all(
        articles.map(async (article) => {
            const {
                articleID,
                createdAt,
                poster,
                publishedAt,
                slug,
                state,
                title,
                updatedAt,
            } = article;

            const {accountID, firstName, lastName} = poster;

            const zonedCreatedAt =
                createdAt.toZonedDateTimeISO(SYSTEM_TIMEZONE);

            const zonedPublishedAt = publishedAt
                ? publishedAt.toZonedDateTimeISO(SYSTEM_TIMEZONE)
                : null;

            const zonedUpdatedAt =
                updatedAt.toZonedDateTimeISO(SYSTEM_TIMEZONE);

            const createdAtText = formatZonedDateTime(zonedCreatedAt);

            const publishedAtText = zonedPublishedAt
                ? formatZonedDateTime(zonedPublishedAt)
                : null;

            const updatedAtText = formatZonedDateTime(zonedUpdatedAt);

            return {
                articleID,
                createdAtText,
                poster: {
                    accountID,
                    firstName,
                    lastName,
                },
                publishedAtText,
                slug,
                state,
                title,
                updatedAtText,
            };
        }),
    );

    return {
        articles: mappedArticles,
        pagination,
    };
}

export default function AdminNews(props: Route.ComponentProps) {
    const {loaderData} = props;
    const {articles, pagination} = loaderData;

    const {page, pages} = pagination;

    const navigation = useNavigation();

    return (
        <Layout.FixedContainer>
            <Title.Text title={`News Articles Page ${page}`}>
                <Spacer />
                <Form method="POST">
                    <Button
                        disabled={navigation.state !== "idle"}
                        colorPalette="green"
                        type="submit"
                        name="action"
                        value="create"
                    >
                        Create News Article
                        <NotesPlusIcon />
                    </Button>
                </Form>
            </Title.Text>

            <Table.ScrollArea
                borderColor="border"
                borderStyle="solid"
                borderWidth="thin"
            >
                <Table.Root showColumnBorder stickyHeader>
                    <Table.Header>
                        <Table.Row
                            css={{
                                _after: {
                                    display: "block",
                                    content: '""',

                                    blockSize: "1px",
                                    inlineSize: "full",

                                    position: "absolute",
                                    insetBlockEnd: "0",
                                    insetInlineStart: "0",

                                    bg: "border",
                                },
                            }}
                        >
                            <Table.ColumnHeader fontWeight="bold">
                                Actions
                            </Table.ColumnHeader>

                            <Table.ColumnHeader fontWeight="bold">
                                Article ID
                            </Table.ColumnHeader>

                            <Table.ColumnHeader fontWeight="bold">
                                Title
                            </Table.ColumnHeader>

                            <Table.ColumnHeader fontWeight="bold">
                                Poster
                            </Table.ColumnHeader>

                            <Table.ColumnHeader fontWeight="bold">
                                State
                            </Table.ColumnHeader>

                            <Table.ColumnHeader fontWeight="bold">
                                Published Date
                            </Table.ColumnHeader>

                            <Table.ColumnHeader fontWeight="bold">
                                Created Date
                            </Table.ColumnHeader>

                            <Table.ColumnHeader fontWeight="bold">
                                Updated Date
                            </Table.ColumnHeader>
                        </Table.Row>
                    </Table.Header>

                    <Table.Body>
                        {articles.map((article, _index) => {
                            const {
                                articleID,
                                createdAtText,
                                poster,
                                publishedAtText,
                                state,
                                title,
                                updatedAtText,
                            } = article;

                            const {accountID, firstName, lastName} = poster;

                            return (
                                <Table.Row key={articleID}>
                                    <Table.Cell textAlign="center">
                                        <IconButton
                                            variant="ghost"
                                            colorPalette="cyan"
                                            size="xs"
                                            asChild
                                        >
                                            <RouterLink
                                                to={`/admin/news/articles/${articleID}`}
                                            >
                                                <EditIcon />
                                            </RouterLink>
                                        </IconButton>
                                    </Table.Cell>

                                    <Table.Cell>
                                        <Code>{articleID}</Code>
                                    </Table.Cell>

                                    <Table.Cell>{title}</Table.Cell>

                                    <Table.Cell>
                                        {lastName}, {firstName} (
                                        <Code>{accountID}</Code>)
                                    </Table.Cell>

                                    <Table.Cell>
                                        {state === "STATE_DRAFT"
                                            ? "draft"
                                            : "published"}
                                    </Table.Cell>

                                    <Table.Cell>
                                        {publishedAtText ?? "-"}
                                    </Table.Cell>

                                    <Table.Cell>{createdAtText}</Table.Cell>
                                    <Table.Cell>{updatedAtText}</Table.Cell>
                                </Table.Row>
                            );
                        })}
                    </Table.Body>
                </Table.Root>
            </Table.ScrollArea>

            <Spacer />

            <Pagination
                currentPage={page}
                pageRange={PAGINATION_PAGE_RANGE}
                pages={pages}
                template={PAGINATION_URL_TEMPLATE}
            />
        </Layout.FixedContainer>
    );
}
