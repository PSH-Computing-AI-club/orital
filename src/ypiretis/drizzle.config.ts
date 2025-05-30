import {join} from "node:path";

import {defineConfig} from "drizzle-kit";

// **NOTE:** This file is executed before Vite is ran. So, we need to use
// normal relative file paths for our imports.

import ENVIRONMENT from "./app/.server/configuration/environment";

const {DATABASE_FILE_PATH} = ENVIRONMENT;

export default defineConfig({
    dialect: "sqlite",

    schema: join(import.meta.dir, "./app/.server/database/tables/index.ts"),
    out: join(import.meta.dir, "./app/.server/database/migrations/"),

    dbCredentials: {
        url: DATABASE_FILE_PATH,
    },
});
