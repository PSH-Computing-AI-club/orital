import {Temporal} from "@js-temporal/polyfill";

import type {SQL} from "drizzle-orm";
import {and, desc, eq, getTableColumns, lte} from "drizzle-orm";

import {slug as slugify} from "github-slugger";

import DATABASE from "../configuration/database";

import {
    IInsertArticle,
    ISelectArticle,
} from "../database/tables/articles_table";
import ARTICLES_TABLE, {
    ARTICLE_STATES as _ARTICLE_STATES,
} from "../database/tables/articles_table";
import type {ISelectUser} from "../database/tables/users_table";
import USERS_TABLE from "../database/tables/users_table";

import type {
    IPaginationOptions,
    IPaginationResults,
} from "../database/utils/pagination";
import {
    executePagination,
    selectPaginationColumns,
} from "../database/utils/pagination";

import type {IUser} from "./users_service";
import {mapUser} from "./users_service";

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

export interface IArticleWithPoster extends IArticle {
    readonly poster: IUser;
}

export interface IPublishedArticle extends IArticle {
    readonly publishedAt: Temporal.Instant;

    readonly state: (typeof ARTICLE_STATES)["published"];
}

export interface IPublishedArticleWithPoster extends IPublishedArticle {
    readonly poster: IUser;
}

export interface IFindAllOptions {
    readonly pagination: IPaginationOptions;
}

export interface IFindAllArticlesResults<T extends IArticle = IArticle> {
    readonly articles: T[];

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

async function internalFindAll(
    options: {
        includePoster: true;
        orderBy?: SQL<unknown>;
        where?: SQL<unknown>;
    } & IFindAllOptions,
): Promise<IFindAllArticlesResults<IPublishedArticleWithPoster>>;
async function internalFindAll(
    options: {
        includePoster: false;
        orderBy?: SQL<unknown>;
        where?: SQL<unknown>;
    } & IFindAllOptions,
): Promise<IFindAllArticlesResults<IPublishedArticle>>;
async function internalFindAll(
    options: {
        includePoster: boolean;
        orderBy?: SQL<unknown>;
        where?: SQL<unknown>;
    } & IFindAllOptions,
): Promise<IFindAllArticlesResults> {
    const {pagination, includePoster, orderBy, where} = options;
    const {limit, page} = pagination;

    let query = DATABASE.select({
        ...getTableColumns(ARTICLES_TABLE),

        ...selectPaginationColumns(ARTICLES_TABLE.id),

        ...(includePoster && {
            poster: USERS_TABLE,
        }),
    })
        .from(ARTICLES_TABLE)
        .$dynamic();

    if (includePoster) {
        // @ts-expect-error - **HACK:** The join works properly. It is just the
        // typing is too strict. So, we are going to just override type checking.
        query =
            //
            query.innerJoin(
                USERS_TABLE,
                eq(ARTICLES_TABLE.posterUserID, USERS_TABLE.id),
            );
    }

    if (where) {
        query = query.where(where);
    }

    if (orderBy) {
        query = query.orderBy(orderBy);
    }

    const {pagination: paginationResults, rows} = await executePagination(
        query,
        {
            limit,
            page,
        },
    );

    const articles = rows.map((row) => {
        const {poster, ...article} = row;

        const mappedArticle = mapArticle(article);

        if (poster) {
            return {
                ...mappedArticle,

                poster: mapUser(poster as ISelectUser),
            };
        }

        return mappedArticle;
    });

    return {
        articles,
        pagination: paginationResults,
    };
}

export async function findOneByArticleID(
    articleID: string,
): Promise<IArticleWithPoster | null> {
    const results = await DATABASE.query.articles.findFirst({
        where: eq(ARTICLES_TABLE.articleID, articleID),

        with: {
            poster: true,
        },
    });

    if (!results) {
        return null;
    }

    const {poster, ...article} = results;

    return {
        ...(mapArticle(article) as IArticle),

        poster: mapUser(poster),
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

export async function findAll(
    options: IFindAllOptions,
): Promise<IFindAllArticlesResults<IArticleWithPoster>> {
    return internalFindAll({...options, includePoster: true});
}

export async function findAllPublished(
    options: IFindAllOptions,
): Promise<IFindAllArticlesResults<IPublishedArticle>> {
    const nowInstant = Temporal.Now.instant();

    return internalFindAll({
        ...options,

        includePoster: false,

        orderBy: desc(ARTICLES_TABLE.publishedAt),
        where: and(
            eq(ARTICLES_TABLE.state, ARTICLE_STATES.published),
            lte(ARTICLES_TABLE.publishedAt, nowInstant),
        ),
    });
}

export async function insertOne(article: IArticleInsert): Promise<IArticle> {
    const [insertedArticle] = await DATABASE.insert(ARTICLES_TABLE)
        .values(article)
        .returning();

    return mapArticle(insertedArticle);
}
