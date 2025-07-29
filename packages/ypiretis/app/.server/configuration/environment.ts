import {exit} from "node:process";

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
import {
    byteSize,
    cronExpression,
    directoryPath,
    filePath,
} from "../utils/valibot";

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

export const ENVIRONMENT_SCHEMA = v.objectAsync({
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

    DATABASE_FILE_PATH: filePath,

    UPLOADS_DIRECTORY_PATH: directoryPath,
    UPLOADS_MAX_FILE_SIZE: byteSize,

    ARTICLES_ATTACHMENTS_MAX_FILE_SIZE: byteSize,

    EVENTS_ATTACHMENTS_MAX_FILE_SIZE: byteSize,

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

    CRONJOB_ROOMS_DISCONNECT_CLEANUP: cronExpression,
    CRONJOB_ROOMS_LIFETIME_CLEANUP: cronExpression,
    CRONJOB_TOKENS_CLEANUP: cronExpression,

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

let ENVIRONMENT: v.InferOutput<typeof ENVIRONMENT_SCHEMA>;

try {
    ENVIRONMENT = await v.parseAsync(ENVIRONMENT_SCHEMA, process.env);
} catch (error) {
    console.error(
        "An error occurred while processing the environment variables:",
    );

    if (error instanceof Error) {
        const {message} = error;

        console.error(message);
    } else {
        console.error((error as any).toString());
    }

    exit(1);
}

export default ENVIRONMENT;
