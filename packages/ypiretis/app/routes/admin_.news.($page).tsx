import {Code, Spacer, Table} from "@chakra-ui/react";

import {data} from "react-router";

import * as v from "valibot";

import {findAll} from "~/.server/services/articles_service";

import {FORMAT_DETAIL, formatZonedDateTime} from "~/.server/utils/locale";
import {SYSTEM_TIMEZONE} from "~/.server/utils/temporal";

import type {IPaginationTemplate} from "~/components/common/pagination";
import Pagination from "~/components/common/pagination";
import Layout from "~/components/controlpanel/layout";
import Title from "~/components/controlpanel/title";

import {validateParams} from "~/guards/validation";

import {Route} from "./+types/admin_.news.($page)";

const ARTICLES_PER_PAGE = 25;

const PAGINATION_PAGE_RANGE = 3;

const PAGINATION_URL_TEMPLATE = (({page}) =>
    `/admin/news/${page}`) satisfies IPaginationTemplate;

const LOADER_PARAMS_SCHEMA = v.object({
    page: v.optional(
        v.pipe(
            v.string(),
            v.transform((value) => Number(value)),
            v.number(),
        ),
    ),
});

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
                state,
                title,
                updatedAt,
            } = article;

            const {firstName, lastName} = poster;

            const zonedCreatedAt =
                createdAt.toZonedDateTimeISO(SYSTEM_TIMEZONE);

            const zonedUpdatedAt = publishedAt
                ? updatedAt.toZonedDateTimeISO(SYSTEM_TIMEZONE)
                : null;

            const zonedPublishedAt = publishedAt
                ? publishedAt.toZonedDateTimeISO(SYSTEM_TIMEZONE)
                : null;

            const createdAtText = formatZonedDateTime(zonedCreatedAt, {
                detail: FORMAT_DETAIL.long,
            });

            const publishedAtText = zonedPublishedAt
                ? formatZonedDateTime(zonedPublishedAt, {
                      detail: FORMAT_DETAIL.long,
                  })
                : null;

            const updatedAtText = zonedUpdatedAt
                ? formatZonedDateTime(zonedUpdatedAt, {
                      detail: FORMAT_DETAIL.long,
                  })
                : null;

            return {
                articleID,
                createdAtText,
                poster: {
                    firstName,
                    lastName,
                },
                publishedAtText,
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

    return (
        <Layout.FixedContainer>
            <Title.Text title={`News Articles Page ${page}`} />

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
                                Created Date
                            </Table.ColumnHeader>

                            <Table.ColumnHeader fontWeight="bold">
                                Published Date
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

                            const {firstName, lastName} = poster;

                            return (
                                <Table.Row key={articleID}>
                                    <Table.Cell>
                                        <Code>{articleID}</Code>
                                    </Table.Cell>

                                    <Table.Cell>{title}</Table.Cell>

                                    <Table.Cell>
                                        {lastName}, {firstName}
                                    </Table.Cell>

                                    <Table.Cell>
                                        {state === "STATE_DRAFT"
                                            ? "draft"
                                            : "published"}
                                    </Table.Cell>

                                    <Table.Cell>{createdAtText}</Table.Cell>

                                    <Table.Cell>
                                        {publishedAtText ?? "-"}
                                    </Table.Cell>

                                    <Table.Cell>
                                        {updatedAtText ?? "-"}
                                    </Table.Cell>
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
