import type {
    InferInsertModel,
    InferSelectModel as DrizzleInferSelectModel,
    InferSelectViewModel,
    Table,
    View,
} from "drizzle-orm";
import {
    asc,
    desc,
    sql,
    getTableColumns,
    getViewSelectedFields,
    isView,
} from "drizzle-orm";

import {useTransaction} from "../state/transaction";

import type {IOptionalFilter} from "./crud_service.filters";

export const SORT_MODES = {
    ascending: "MODE_ASCENDING",

    descending: "MODE_DESCENDING",
} as const;

type InferSelectModel<T extends Table | View> = T extends Table
    ? DrizzleInferSelectModel<T>
    : T extends View
      ? InferSelectViewModel<T>
      : never;

export type InferMappedModel<T> =
    T extends IReadableCRUDService<Table | View, infer _, infer M> ? M : never;

export type InferUpdateModel<T extends Table> = Partial<InferInsertModel<T>>;

export interface IPaginationOptions {
    readonly limit: number;

    readonly page: number;
}

export interface IPaginationResults {
    readonly page: number;

    readonly pages: number;
}

export type ISortModes = (typeof SORT_MODES)[keyof typeof SORT_MODES];

export interface ISortOptions<T extends Table | View> {
    readonly by: keyof InferSelectModel<T>;

    readonly mode?: ISortModes;
}

export interface IDeleteOneOptions<T extends Table> {
    readonly where: IOptionalFilter<T>;
}

export interface IDeleteAllOptions<T extends Table> {
    readonly where?: IOptionalFilter<T>;
}

export interface IFindOneOptions<T extends Table | View> {
    readonly where: IOptionalFilter<T>;
}

export interface IFindAllOptions<T extends Table | View> {
    readonly pagination: IPaginationOptions;

    readonly sort?: ISortOptions<T>;

    readonly where?: IOptionalFilter<T>;
}

export interface IFindAllResults<
    T extends Table | View,
    S extends InferSelectModel<T> = InferSelectModel<T>,
> {
    readonly pagination: IPaginationResults;

    readonly values: S[];
}

export interface IInsertOneOptions<
    T extends Table,
    I extends InferInsertModel<T> = InferInsertModel<T>,
> {
    readonly values: I;
}

export interface IInsertAllOptions<
    T extends Table,
    I extends InferInsertModel<T> = InferInsertModel<T>,
> {
    readonly values: I[];
}

export interface IUpdateOneOptions<
    T extends Table,
    U extends InferUpdateModel<T> = InferUpdateModel<T>,
> {
    readonly values: U;

    readonly where: IOptionalFilter<T>;
}

export interface IUpdateAllOptions<
    T extends Table,
    U extends InferUpdateModel<T> = InferUpdateModel<T>,
> {
    readonly values: U;

    readonly where?: IOptionalFilter<T>;
}

export interface ICRUDReadableServiceOptions<
    T extends Table | View,
    S extends InferSelectModel<T> = InferSelectModel<T>,
    M extends S = S,
> {
    readonly mapValue?: (value: S) => M;

    readonly table: T;
}

export interface ICRUDWritableServiceOptions<
    T extends Table,
    S extends InferSelectModel<T> = InferSelectModel<T>,
    M extends S = S,
> extends ICRUDReadableServiceOptions<T, S, M> {}

export interface IReadableCRUDService<
    T extends Table | View,
    S extends InferSelectModel<T> = InferSelectModel<T>,
    M extends S = S,
> {
    findOne(options: IFindOneOptions<T>): Promise<M | null>;

    findAll(options: IFindAllOptions<T>): Promise<IFindAllResults<T, M>>;
}

export interface IWritableCRUDService<
    T extends Table,
    S extends InferSelectModel<T> = InferSelectModel<T>,
    I extends InferInsertModel<T> = InferInsertModel<T>,
    U extends InferUpdateModel<T> = InferUpdateModel<T>,
    M extends S = S,
> extends IReadableCRUDService<T, S, M> {
    deleteOne(options: IDeleteOneOptions<T>): Promise<M | null>;

    deleteAll(options: IDeleteAllOptions<T>): Promise<M[]>;

    insertOne(options: IInsertOneOptions<T, I>): Promise<M>;

    insertAll(options: IInsertAllOptions<T, I>): Promise<M[]>;

    updateOne(options: IUpdateOneOptions<T, U>): Promise<M | null>;

    updateAll(options: IUpdateAllOptions<T, U>): Promise<M[]>;
}

function getFields<T extends Table | View>(table: T) {
    if (isView(table)) {
        return getViewSelectedFields(table);
    }

    return getTableColumns(table);
}

function matchSortMode(mode: ISortModes): typeof asc | typeof desc {
    switch (mode) {
        case SORT_MODES.ascending:
            return asc;

        case SORT_MODES.descending:
            return desc;
    }
}

export function makeReadableCRUDService<
    T extends Table | View,
    S extends InferSelectModel<T> = InferSelectModel<T>,
    M extends S = S,
>(
    options: ICRUDReadableServiceOptions<T, S, M>,
): IReadableCRUDService<T, S, M> {
    const {mapValue, table} = options;

    return {
        async findOne(options) {
            const {where} = options;

            if (!where) {
                return null;
            }

            const transaction = useTransaction();

            const row = (await transaction
                .select()
                // **HACK:** `.from` accepts views but Drizzle's typing is not set
                // up properly just to accept the base `View` type.
                .from(table as Table)
                .where(where(table))
                .limit(1)
                // **HACK:** The type is too complex for TypeScript to properly narrow
                // into `S`. So, we need to forcibly narrow it.
                .get()) as S;

            if (!row) {
                return null;
            }

            return mapValue ? mapValue(row) : (row as M);
        },

        async findAll(options) {
            const {pagination, sort, where} = options;
            const {limit, page} = pagination;

            const transaction = useTransaction();

            let query = transaction
                // @ts-expect-error - **HACK:** TypeScript is having a hard
                // time inferring the complex typing of `View`. So, we need
                // surpress the typing error caused form `getFields`.
                .select({
                    ...getFields(table),

                    _rowCount: sql<number>`COUNT(*) OVER()`.as("_row_count"),
                })

                // **HACK:** See the above comment about `View` typing.
                .from(table as Table)
                .limit(limit)
                .offset((page - 1) * limit)
                .$dynamic();

            if (where) {
                query = query.where(where(table));
            }

            if (sort) {
                const {by, mode = SORT_MODES.ascending} = sort;

                // @ts-expect-error - HACK: If we were given a table, then it is
                // indexable. We just cannot know the type here.
                const column = table[by];
                const sorting = matchSortMode(mode);

                query = query.orderBy(sorting(column));
            }

            const rows = (await query) as unknown as (S & {
                _rowCount: number;
            })[];

            if (rows.length === 0) {
                return {
                    pagination: {
                        page,
                        pages: 1,
                    },

                    values: [],
                };
            }

            const rowCount = rows[0]._rowCount;
            const pages = Math.ceil(rowCount / limit);

            const mappedRows = rows.map((row) => {
                const {_rowCount, ...rest} = row;

                // **HACK:** See the above comment about type narrowing.
                return mapValue
                    ? mapValue(rest as unknown as S)
                    : (rest as unknown as M);
            });

            return {
                values: mappedRows,

                pagination: {
                    page,
                    pages,
                },
            };
        },
    };
}

export function makeWritableCRUDService<
    T extends Table,
    S extends InferSelectModel<T> = InferSelectModel<T>,
    I extends InferInsertModel<T> = InferInsertModel<T>,
    U extends InferUpdateModel<T> = InferUpdateModel<T>,
    M extends S = S,
>(
    options: ICRUDWritableServiceOptions<T, S, M>,
): IWritableCRUDService<T, S, I, U, M> {
    const {mapValue, table} = options;

    const readableService = makeReadableCRUDService<T, S, M>(options);

    return {
        ...readableService,

        async deleteOne(options) {
            const {where} = options;

            if (!where) {
                return null;
            }

            const transaction = useTransaction();

            const row = (await transaction
                .delete(table)
                .where(where(table))
                // **HACK:** Bun's SQLite3 driver is not compiled with `LIMIT`
                // enabled for DELETE and UPDATE operations.
                //
                //.limit(1)
                .returning()

                .get()) as S | undefined; // **HACK:** See the above comment about type narrowing.

            if (!row) {
                return null;
            }

            return mapValue ? mapValue(row) : (row as M);
        },

        async deleteAll(options) {
            const {where} = options;

            const transaction = useTransaction();

            let query = transaction.delete(table);

            if (where) {
                query.where(where(table));
            }

            const rows = (await query.returning()) as unknown as S[]; // **HACK:** See the above comment about type narrowing.

            return mapValue
                ? rows.map((row) => {
                      return mapValue(row);
                  })
                : (rows as M[]);
        },

        async insertOne(options) {
            const {values} = options;

            const transaction = useTransaction();

            const row = (await transaction
                .insert(table)
                .values(values)
                .returning()
                .get()) as unknown as S; // **HACK:** See the above comment about type narrowing.

            return mapValue ? mapValue(row) : (row as M);
        },

        async insertAll(options) {
            const {values} = options;

            const transaction = useTransaction();

            const rows = (await transaction
                .insert(table)
                .values(values)
                .returning()) as unknown as S[]; // **HACK:** See the above comment about type narrowing.

            return mapValue
                ? rows.map((row) => {
                      return mapValue(row);
                  })
                : (rows as M[]);
        },

        async updateOne(options) {
            const {values, where} = options;

            if (!where) {
                return null;
            }

            const transaction = useTransaction();

            const row = (await transaction
                .update(table)
                .set(values)
                .where(where(table))
                // **HACK:** See above comment in `deleteOne` about Bun support.
                //
                //.limit(1)
                .returning()
                .get()) as unknown as S; // **HACK:** See the above comment about type narrowing.

            if (!row) {
                return null;
            }

            return mapValue ? mapValue(row) : (row as M);
        },

        async updateAll(options) {
            const {values, where} = options;

            const transaction = useTransaction();

            let query = transaction.update(table).set(values);

            if (where) {
                query.where(where(table));
            }

            const rows = (await query.returning()) as unknown as S[]; // **HACK:** See the above comment about type narrowing.

            return mapValue
                ? rows.map((row) => {
                      return mapValue(row);
                  })
                : (rows as M[]);
        },
    };
}
