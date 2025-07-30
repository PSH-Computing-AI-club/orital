import {Database} from "bun:sqlite";

import {drizzle} from "drizzle-orm/bun-sqlite";

import * as DATABASE_RELATIONS from "../database/tables/relations";
import * as DATABASE_SCHEMA from "../database/tables/schema";

import ENVIRONMENT from "./environment";

const {DATABASE_FILE_PATH} = ENVIRONMENT;

const CLIENT = new Database(DATABASE_FILE_PATH, {
    create: true,
    readwrite: true,
    strict: true,
});

CLIENT.run("PRAGMA journal_mode = WAL;");

const DATABASE = drizzle({
    client: CLIENT,

    schema: {
        ...DATABASE_SCHEMA,
        ...DATABASE_RELATIONS,
    },
});

export type IDatabase = typeof DATABASE;

export type ITransaction = Parameters<
    Parameters<typeof DATABASE.transaction>[0]
>[0];

export default DATABASE;
