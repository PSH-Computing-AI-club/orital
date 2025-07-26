import {Temporal} from "@js-temporal/polyfill";

import * as v from "valibot";

import {
    alphanumerical,
    domain,
    duration,
    hostname,
    identifier,
    list,
} from "../../utils/valibot";

import makeSecret from "../utils/secret";
import {cron_expression} from "../utils/valibot";

export const NODE_ENVIRONMENT_MODES = {
    development: "development",

    production: "production",

    test: "test",
} as const;

export const LOGGING_LEVELS = {
    debug: "debug",

    error: "error",

    fatal: "fatal",

    info: "info",

    trace: "trace",

    warn: "warn",
} as const;

export const ENVIRONMENT_SCHEMA = v.object({
    NODE_ENV: v.enum(NODE_ENVIRONMENT_MODES),

    SERVER_LOGGING_LEVEL: v.enum(LOGGING_LEVELS),

    SERVER_HOST: hostname,
    SERVER_PORT: v.pipe(
        v.string(),
        v.transform((value) => Number(value)),
    ),

    SECRET_KEY: v.pipe(
        v.string(),
        v.minBytes(32),
        v.transform((value) => makeSecret(value)),
    ),

    SECRET_SALT: v.pipe(
        v.string(),
        v.minBytes(32),
        v.transform((value) => makeSecret(value)),
    ),

    // **TODO:** verify that string is a file path
    DATABASE_FILE_PATH: v.string(),

    // **TODO:** verify that string is a file path
    UPLOADS_DIRECTORY_PATH: v.string(),

    SMTP_HOST: hostname,
    SMTP_PORT: v.pipe(
        v.string(),
        v.transform((value) => Number(value)),
    ),

    SMTP_EMAIL: v.pipe(v.string(), v.rfcEmail()),
    SMTP_PASSWORD: v.string(),

    APP_NAME: v.pipe(v.string(), v.maxLength(32)),
    APP_URL: v.pipe(
        v.string(),
        v.url(),
        v.transform((value) => new URL(value)),
    ),

    ACCOUNT_PROVIDER_DOMAIN: v.pipe(v.string(), domain),
    ACCOUNT_PROVIDER_NAME: v.pipe(v.string(), v.maxLength(64)),

    ACCOUNT_ADMIN_IDENTIFIERS: v.pipe(
        list,
        v.array(v.pipe(v.string(), identifier)),
    ),

    SESSION_EPHEMERAL_TTL: v.pipe(
        v.string(),
        duration,
        v.transform((value) => Temporal.Duration.from(value)),
    ),

    SESSION_PERSISTENT_TTL: v.pipe(
        v.string(),
        duration,
        v.transform((value) => Temporal.Duration.from(value)),
    ),

    TOKEN_CALLBACK_TTL: v.pipe(
        v.string(),
        duration,
        v.transform((value) => Temporal.Duration.from(value)),
    ),

    TOKEN_CONSENT_TTL: v.pipe(
        v.string(),
        duration,
        v.transform((value) => Temporal.Duration.from(value)),
    ),

    TOKEN_GRANT_TTL: v.pipe(
        v.string(),
        duration,
        v.transform((value) => Temporal.Duration.from(value)),
    ),

    ROOMS_DISCONNECT_TTL: v.pipe(
        v.string(),
        duration,
        v.transform((value) => Temporal.Duration.from(value)),
    ),

    ROOMS_LIFETIME_TTL: v.pipe(
        v.string(),
        duration,
        v.transform((value) => Temporal.Duration.from(value)),
    ),

    CRONJOB_ROOMS_DISCONNECT_CLEANUP: cron_expression,
    CRONJOB_ROOMS_LIFETIME_CLEANUP: cron_expression,
    CRONJOB_TOKENS_CLEANUP: cron_expression,

    QUEUE_EMAILS_MAX: v.pipe(
        v.string(),
        v.transform((value) => Number(value)),
        v.number(),
    ),

    DISCORD_INVITE_CODE: v.pipe(v.string(), alphanumerical),

    ENGAGE_ORGANIZATION_IDENTIFIER: v.pipe(v.string(), identifier),

    GITHUB_ORGANIZATION_IDENTIFIER: v.pipe(v.string(), identifier),
});

export type IEnvironmentSchema = v.InferInput<typeof ENVIRONMENT_SCHEMA>;

export type IEnvironmentParsed = v.InferOutput<typeof ENVIRONMENT_SCHEMA>;

const ENVIRONMENT = v.parse(ENVIRONMENT_SCHEMA, process.env);

export default ENVIRONMENT;
