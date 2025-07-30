import {Temporal} from "@js-temporal/polyfill";

import type {InferInsertModel, InferSelectModel} from "drizzle-orm";
import {eq} from "drizzle-orm";

import {isValid, ulid} from "ulid";

import type {ITokensTable} from "../database/tables/tokens_table";

import {useTransaction} from "../state/transaction";

import {hashSecret} from "../utils/crypto";
import type {ISecret, ISecretMaybe} from "../utils/secret";
import makeSecret, {exposeIfSecret, makeSecretIfPlain} from "../utils/secret";
import {UNIX_EPOCH} from "../utils/temporal";
import type {OmitViaRemap} from "../utils/types";

export type IToken<T extends ITokensTable> = {
    token: ITokenSecret;
} & Omit<InferSelectModel<T>, "hash">;

export type ITokenInsertData<T> = T extends ITokensTable
    ? // **NOTE:** TypeScript's built-in `Omit` mishandles `InferInsertModel`'s
      // complex typing when being evaluated via a generic. Due to the built-in's
      // usage of `Exclude`, all nullable columns are lost.
      //
      // So, we have to use our custom omit type instead.
      OmitViaRemap<
          InferInsertModel<T>,
          "createdAt" | "expiresAt" | "hash" | "id"
      >
    : never;

export type ITokenSecret = ISecret<string>;

export type ITokenSecretMaybe = ISecretMaybe<string>;

export interface ITokensServiceOptions<T extends ITokensTable> {
    readonly duration: Temporal.Duration;

    readonly namespace: string;

    readonly table: T;
}

export interface ITokensService<
    T extends ITokensTable,
    V extends IToken<T> = IToken<T>,
> {
    deleteOne(id: number): Promise<void>;

    findOne(id: number): Promise<Omit<V, "token"> | null>;

    findOneByToken(tokenSecret: ITokenSecretMaybe): Promise<V | null>;

    insertOne(tokenInsertData: ITokenInsertData<T>): Promise<V>;
}

export default function makeTokensService<
    T extends ITokensTable,
    V extends IToken<T> = IToken<T>,
>(options: ITokensServiceOptions<T>): ITokensService<T> {
    const {duration, namespace, table} = options;

    const prefix = `${namespace}_`;
    const ttl = duration.total({
        relativeTo: UNIX_EPOCH,
        unit: "milliseconds",
    });

    return {
        async deleteOne(id) {
            const transaction = useTransaction();

            await transaction.delete(table).where(eq(table.id, id));
        },

        async findOne(id) {
            const transaction = useTransaction();

            const [firstToken] = await transaction
                .select()
                .from(table)
                .where(eq(table.id, id))
                .limit(1);

            if (!firstToken) {
                return null;
            }

            const {hash: _hash, expiresAt, ...tokenColumns} = firstToken;
            const now = Temporal.Now.instant();

            if (Temporal.Instant.compare(expiresAt, now) === -1) {
                await transaction
                    .delete(table)
                    .where(eq(table.id, id))
                    .limit(1);

                return null;
            }

            return {
                ...tokenColumns,
                expiresAt,
                id,
            } as unknown as Omit<V, "token">;
        },

        async findOneByToken(tokenSecret) {
            const token = exposeIfSecret(tokenSecret);

            if (!token.startsWith(prefix)) {
                return null;
            }

            if (!isValid(token.slice(prefix.length))) {
                return null;
            }

            const hash = hashSecret(token);

            const transaction = useTransaction();

            const [firstToken] = await transaction
                .select()
                .from(table)
                .where(
                    eq(
                        table.hash,
                        // **HACK:** Same as `insertOne`.
                        hash as unknown as ITokenSecret,
                    ),
                )
                .limit(1);

            if (!firstToken) {
                return null;
            }

            const {hash: _hash, expiresAt, id, ...tokenColumns} = firstToken;
            const now = Temporal.Now.instant();

            if (Temporal.Instant.compare(expiresAt, now) === -1) {
                await transaction
                    .delete(table)
                    .where(eq(table.id, id))
                    .limit(1);

                return null;
            }

            tokenSecret = makeSecretIfPlain(token);

            return {
                ...tokenColumns,
                expiresAt,
                id,
                token: tokenSecret,
            } as unknown as V;
        },

        async insertOne(tokenInsertData) {
            const token = prefix + ulid();
            const tokenSecret = makeSecret(token);

            const createdAt = Temporal.Now.instant();
            const expiresAt = createdAt.add({
                milliseconds: ttl,
            });

            const hash = hashSecret(token);

            const transaction = useTransaction();

            const [insertedToken] = await transaction
                .insert(
                    // **HACK:** TypeScript hates my generic ;-;... So, we have to
                    // force the issue and hard cast the typing to the super table
                    // typing.
                    table as ITokensTable,
                )
                .values({
                    ...tokenInsertData,

                    createdAt,
                    expiresAt,
                    // **HACK:** The `customType` implementation expects the values
                    // to be wrapped as a secret or not.
                    //
                    // It is just the typing is too rigid to please TypeScript.
                    hash: hash as unknown as ITokenSecret,
                })
                .returning();

            const {hash: _hash, ...tokenColumns} = insertedToken;

            return {
                ...tokenColumns,
                token: tokenSecret,
            } as unknown as V;
        },
    };
}
