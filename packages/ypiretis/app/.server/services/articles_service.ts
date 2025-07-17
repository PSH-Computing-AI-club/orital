import {Temporal} from "@js-temporal/polyfill";

import {and, desc, eq, getTableColumns, lte, sql} from "drizzle-orm";

import {slug as slugify} from "github-slugger";

import DATABASE from "../configuration/database";

import {
    IInsertArticle,
    ISelectArticle,
} from "../database/tables/articles_table";
import ARTICLES_TABLE, {
    ARTICLE_STATES as _ARTICLE_STATES,
} from "../database/tables/articles_table";

import type {IUser} from "./users_service";
import {mapUser} from "./users_service";
import type {IPaginationOptions, IPaginationResults} from "./types";

export const ARTICLE_STATES = _ARTICLE_STATES;

export type IArticle = ISelectArticle & {
    readonly slug: string;
};

export type IArticleInsert = Omit<
    IInsertArticle,
    "articleID" | "createdAt" | "id" | "publishedAt" | "updatedAt"
>;

export type IArticleUpdate = Partial<
    Omit<
        IInsertArticle,
        "articleID" | "createdAt" | "id" | "posterUserID" | "updatedAt"
    >
>;

export interface IPublishedArticle extends IArticle {
    readonly publishedAt: Temporal.Instant;

    readonly state: (typeof ARTICLE_STATES)["published"];
}

export interface IPublishedArticleWithPoster extends IPublishedArticle {
    readonly poster: IUser;
}
export interface IFindAllPublishedArticlesOptions {
    readonly pagination: IPaginationOptions;
}

export interface IFindAllPublishedArticlesResults {
    readonly articles: IPublishedArticle[];

    readonly pagination: IPaginationResults;
}

function mapArticle(article: ISelectArticle): IArticle {
    const {title} = article;

    const slug = slugify(title, false);

    return {
        ...article,

        slug,
    };
}

export async function findOnePublishedByArticleID(
    articleID: string,
): Promise<IPublishedArticleWithPoster | null> {
    const nowInstant = Temporal.Now.instant();

    const results = await DATABASE.query.articles.findFirst({
        where: and(
            eq(ARTICLES_TABLE.articleID, articleID),
            eq(ARTICLES_TABLE.state, ARTICLE_STATES.published),
            lte(ARTICLES_TABLE.publishedAt, nowInstant),
        ),

        with: {
            poster: true,
        },
    });

    if (!results) {
        return null;
    }

    const {poster, ...article} = results;

    return {
        ...(mapArticle(article) as IPublishedArticle),

        poster: mapUser(poster),
    };
}

export async function findAllPublished(
    options: IFindAllPublishedArticlesOptions,
): Promise<IFindAllPublishedArticlesResults> {
    const {pagination} = options;
    const {limit, page} = pagination;

    const offset = (page - 1) * limit;
    const nowInstant = Temporal.Now.instant();

    const results = await DATABASE.select({
        ...getTableColumns(ARTICLES_TABLE),

        articleCount: sql<number>`COUNT(${ARTICLES_TABLE.id}) OVER()`.as(
            "article_count",
        ),
    })
        .from(ARTICLES_TABLE)
        .where(
            and(
                eq(ARTICLES_TABLE.state, ARTICLE_STATES.published),
                lte(ARTICLES_TABLE.publishedAt, nowInstant),
            ),
        )
        .orderBy(desc(ARTICLES_TABLE.publishedAt))
        .limit(limit)
        .offset(offset);

    if (results.length === 0) {
        return {
            articles: [],

            pagination: {
                page,
                pages: 1,
            },
        };
    }

    const {articleCount} = results[0];
    const pages = Math.ceil(articleCount / limit);

    const articles = results.map((result) => {
        const {articleCount: _articleCount, ...article} = result;

        return mapArticle(article) as IPublishedArticle;
    });

    return {
        articles,

        pagination: {
            page,
            pages,
        },
    };
}
