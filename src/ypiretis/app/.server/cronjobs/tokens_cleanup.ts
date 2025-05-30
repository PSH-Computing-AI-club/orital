// **TODO:** Add robust logging.
// - amount of tokens cleared

import {Temporal} from "@js-temporal/polyfill";

import {lt} from "drizzle-orm";

import DATABASE from "../configuration/database";
import ENVIRONMENT from "../configuration/environment";

import CALLBACK_TOKENS_TABLE from "../database/tables/callback_tokens_table";
import CONSENT_TOKENS_TABLE from "../database/tables/consent_tokens_table";
import GRANT_TOKENS_TABLE from "../database/tables/grant_tokens_table";
import type {ITokensTable} from "../database/tables/tokens_table";

export const CRONJOB_DURATION = ENVIRONMENT.CRONJOB_TOKENS_CLEANUP;

export default async function CronjobTokensCleanup() {
    const now = Temporal.Now.instant();

    const cleanupTable = (table: ITokensTable) =>
        DATABASE.delete(table).where(lt(table.expiresAt, now));

    await Promise.all([
        cleanupTable(CALLBACK_TOKENS_TABLE),
        cleanupTable(CONSENT_TOKENS_TABLE),
        cleanupTable(GRANT_TOKENS_TABLE),
    ]);
}
