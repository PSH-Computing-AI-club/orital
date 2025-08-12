import {defineConfig} from "drizzle-kit";

// **NOTE:** This file is executed before Vite is ran. So, we need to use
// normal relative file paths for our imports.

import RUNTIME_ENVIRONMENT from "./app/.server/configuration/runtime_environment";

const {DATABASE_FILE_PATH} = RUNTIME_ENVIRONMENT;

export default defineConfig({
    dialect: "sqlite",

    schema: "./app/.server/database/schema.ts",
    out: "./app/.server/database/migrations/",

    dbCredentials: {
        url: DATABASE_FILE_PATH,
    },
});
