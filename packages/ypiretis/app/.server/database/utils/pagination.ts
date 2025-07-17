import {sql} from "drizzle-orm";

import type {SQLiteColumn, SQLiteSelect} from "drizzle-orm/sqlite-core";

type InferSelectRow<T extends SQLiteSelect> = T["_"]["result"][0];

export type IPaginationSelect = SQLiteSelect & {
    _: {
        result: {
            ["_rowCount"]: number;
        }[];
    };
};

export interface IPaginationOptions {
    readonly limit: number;

    readonly page: number;
}

export interface IPaginationResults {
    readonly page: number;

    readonly pages: number;
}

export interface IResults<T extends IPaginationSelect> {
    readonly pagination: IPaginationResults;

    readonly rows: Omit<InferSelectRow<T>, "_rowCount">[];
}

export function selectPaginationColumns(column: SQLiteColumn) {
    return {
        ["_rowCount"]: sql<number>`COUNT(${column}) OVER()`.as("_row_count"),
    };
}

export async function executePagination<T extends IPaginationSelect>(
    query: T,
    options: IPaginationOptions,
): Promise<IResults<T>> {
    const {limit, page} = options;

    const results = await query.limit(limit).offset((page - 1) * limit);

    if (results.length === 0) {
        return {
            pagination: {
                page,
                pages: 1,
            },

            rows: [],
        };
    }

    const rowCount = results[0]._rowCount;
    const pages = Math.ceil(rowCount / limit);

    const rows = results.map((result) => {
        const {_rowCount, ...row} = result;

        return row;
    }) as Omit<InferSelectRow<T>, "_rowCount">[];

    return {
        rows,

        pagination: {
            page,
            pages,
        },
    };
}
