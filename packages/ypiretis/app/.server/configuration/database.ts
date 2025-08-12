import {Database} from "bun:sqlite";

import {drizzle} from "drizzle-orm/bun-sqlite";

import * as SCHEMA from "../database/schema";

import RUNTIME_ENVIRONMENT from "./runtime_environment";

const {DATABASE_FILE_PATH} = RUNTIME_ENVIRONMENT;

const CLIENT = new Database(DATABASE_FILE_PATH, {
    create: true,
    readwrite: true,
    strict: true,
});

CLIENT.run("PRAGMA journal_mode = WAL;");

const DATABASE = drizzle({
    client: CLIENT,

    schema: {
        ...SCHEMA,
    },
});

export type IDatabase = typeof DATABASE;

export type ITransaction = Parameters<
    Parameters<typeof DATABASE.transaction>[0]
>[0];

export default DATABASE;
