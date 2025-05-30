// **NOTE:** This script only exists because `drizzle-kit` does not support Bun's
// SQLite3 driver by default.

import {migrate} from "drizzle-orm/bun-sqlite/migrator";

import DRIZZLE_KIT_CONFIG from "../drizzle.config";

import DATABASE from "../app/.server/configuration/database";

migrate(DATABASE, {
    migrationsFolder: DRIZZLE_KIT_CONFIG.out!,
});
