import {Database} from "bun:sqlite";

import {mkdir} from "node:fs/promises";

import {dirname} from "node:path";

import {drizzle} from "drizzle-orm/bun-sqlite";

import * as DATABASE_SCHEMA from "../database/tables";
import * as DATABASE_RELATIONS from "../database/tables/relations";

import ENVIRONMENT from "./environment";

const {DATABASE_FILE_PATH} = ENVIRONMENT;

const DATABASE_DIRECTORY_PATH = dirname(DATABASE_FILE_PATH);

await mkdir(DATABASE_DIRECTORY_PATH, {
    recursive: true,
});

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

export default DATABASE;
