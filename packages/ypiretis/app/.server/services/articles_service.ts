import {slug as slugify} from "github-slugger";

import {
    IArticlesTable,
    IArticleStates as _IArticleStates,
    IInsertArticle as _IInsertArticle,
    ISelectArticle as _ISelectArticle,
    IUpdateArticle as _IUpdateArticle,
} from "../database/tables/articles_table";
import ARTICLES_TABLE, {
    ARTICLE_STATES as _ARTICLE_STATES,
} from "../database/tables/articles_table";
import ARTICLES_ATTACHMENTS_TABLE from "../database/tables/articles_attachments_table";
import type {ISelectUser as _ISelectUser} from "../database/tables/users_table";
import type {
    IArticlesWithPosterView,
    ISelectArticleWithPoster as _ISelectArticleWithPoster,
} from "../database/views/articles_with_poster_view";
import ARTICLES_WITH_POSTER_VIEW from "../database/views/articles_with_poster_view";
import type {
    IPublishedArticlesView,
    ISelectPublishedArticle as _ISelectPublishedArticle,
} from "../database/views/published_articles_view";
import PUBLISHED_ARTICLES_VIEW from "../database/views/published_articles_view";
import type {
    IPublishedArticlesWithPosterView,
    ISelectPublishedArticleWithPoster as _ISelectPublishedArticleWithPoster,
} from "../database/views/published_articles_with_poster_view";
import PUBLISHED_ARTICLES_WITH_POSTER_VIEW from "../database/views/published_articles_with_poster_view";

import makeAttachmentsService from "./attachments_service";
import {makeReadableCRUDService, makeWritableCRUDService} from "./crud_service";
import type {IUser} from "./users_service";
import {mapUser} from "./users_service";

export const ARTICLE_STATES = _ARTICLE_STATES;

type IArticleMappedData = {
    readonly hasBeenEdited: boolean;

    readonly slug: string;
};

type IArticleMappedPosterData = {
    readonly poster: IUser;
};

export type IArticleStates = _IArticleStates;

export type IArticle = _ISelectArticle & IArticleMappedData;

export type IArticleInsert = _IInsertArticle;

export type IArticleUpdate = _IUpdateArticle;

export type IArticleWithPoster = _ISelectArticleWithPoster &
    IArticleMappedData &
    IArticleMappedPosterData;

export type IPublishedArticle = _ISelectPublishedArticle & IArticleMappedData;

export type IPublishedArticleWithPoster = _ISelectPublishedArticleWithPoster &
    IArticleMappedData &
    IArticleMappedPosterData;

export const {
    deleteOneAttachment,
    findAllAttachmentsByTargetID: findAllAttachmentsByID,
    handleOneAttachment,
} = makeAttachmentsService({
    table: ARTICLES_ATTACHMENTS_TABLE,
});

export const {
    deleteAll,
    deleteOne,
    findAll,
    findOne,
    insertAll,
    insertOne,
    updateAll,
    updateOne,
} = makeWritableCRUDService<
    IArticlesTable,
    _ISelectArticle,
    _IInsertArticle,
    _IUpdateArticle,
    IArticle
>({
    table: ARTICLES_TABLE,
    mapValue: mapArticle,
});

export const {findOne: findOneWithPoster, findAll: findAllWithPoster} =
    makeReadableCRUDService<
        IArticlesWithPosterView,
        _ISelectArticleWithPoster,
        IArticleWithPoster
    >({
        table: ARTICLES_WITH_POSTER_VIEW,
        mapValue: mapArticleWithPoster,
    });

export const {findOne: findOnePublished, findAll: findAllPublished} =
    makeReadableCRUDService<
        IPublishedArticlesView,
        _ISelectPublishedArticle,
        IPublishedArticle
    >({
        table: PUBLISHED_ARTICLES_VIEW,
        mapValue: mapArticle,
    });

export const {
    findOne: findOnePublishedWithPoster,
    findAll: findAllPublishedWithPoster,
} = makeReadableCRUDService<
    IPublishedArticlesWithPosterView,
    _ISelectPublishedArticleWithPoster,
    IPublishedArticleWithPoster
>({
    table: PUBLISHED_ARTICLES_WITH_POSTER_VIEW,
    mapValue: mapArticleWithPoster,
});

export function mapArticle<T extends _ISelectArticle, R extends IArticle>(
    article: T,
): R {
    const {publishedAt, title, updatedAt} = article;

    const hasBeenEdited = publishedAt
        ? updatedAt.epochMilliseconds - publishedAt.epochMilliseconds >
          1000 * 60
        : false;

    const slug = slugify(title, false);

    return {
        ...article,

        hasBeenEdited,
        slug,
    } as unknown as R;
}

export function mapArticleWithPoster<
    T extends _ISelectArticleWithPoster,
    R extends IArticleWithPoster,
>(article: T): R {
    const {poster} = article;

    return {
        ...mapArticle(article),

        poster: mapUser(poster),
    };
}
