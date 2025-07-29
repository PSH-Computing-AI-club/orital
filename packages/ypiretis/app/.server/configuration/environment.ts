import {exit} from "node:process";

import * as v from "valibot";

import {
    alphanumerical,
    email,
    identifier,
    identifierList,
    number,
    url,
} from "../../utils/valibot";

import {
    byteSize,
    cronExpression,
    cryptographicKey,
    domain,
    directoryPath,
    duration,
    hostname,
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
    SERVER_PORT: number,

    SECRET_KEY: cryptographicKey,
    SECRET_SALT: cryptographicKey,

    DATABASE_FILE_PATH: filePath,

    UPLOADS_DIRECTORY_PATH: directoryPath,
    UPLOADS_MAX_FILE_SIZE: byteSize,

    ARTICLES_ATTACHMENTS_MAX_FILE_SIZE: byteSize,

    EVENTS_ATTACHMENTS_MAX_FILE_SIZE: byteSize,

    SMTP_HOST: hostname,
    SMTP_PORT: number,

    SMTP_EMAIL: email,
    SMTP_PASSWORD: v.string(),

    APP_NAME: v.pipe(v.string(), v.nonEmpty(), v.maxLength(32)),
    APP_URL: url,

    ACCOUNT_PROVIDER_DOMAIN: domain,
    ACCOUNT_PROVIDER_NAME: v.pipe(v.string(), v.nonEmpty(), v.maxLength(64)),

    ACCOUNT_ADMIN_IDENTIFIERS: identifierList,

    SESSION_EPHEMERAL_TTL: duration,
    SESSION_PERSISTENT_TTL: duration,

    TOKEN_CALLBACK_TTL: duration,
    TOKEN_CONSENT_TTL: duration,
    TOKEN_GRANT_TTL: duration,

    ROOMS_DISCONNECT_TTL: duration,
    ROOMS_LIFETIME_TTL: duration,

    CRONJOB_ROOMS_DISCONNECT_CLEANUP: cronExpression,
    CRONJOB_ROOMS_LIFETIME_CLEANUP: cronExpression,
    CRONJOB_TOKENS_CLEANUP: cronExpression,

    QUEUE_EMAILS_MAX: number,

    DISCORD_INVITE_CODE: alphanumerical,

    ENGAGE_ORGANIZATION_IDENTIFIER: identifier,

    GITHUB_ORGANIZATION_IDENTIFIER: identifier,
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
