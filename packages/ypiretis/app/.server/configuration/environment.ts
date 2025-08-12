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
    secret,
} from "../utils/valibot";

export const LOGGING_LEVELS = {
    debug: "debug",

    error: "error",

    fatal: "fatal",

    info: "info",

    trace: "trace",

    warn: "warn",
} as const;

export const NODE_ENVIRONMENT_MODES = {
    development: "development",

    production: "production",

    test: "test",
} as const;

export const ENVIRONMENT_SCHEMA = v.object({
    NODE_ENV: v.optional(
        v.enum(NODE_ENVIRONMENT_MODES),
        NODE_ENVIRONMENT_MODES.development,
    ),

    SERVER_LOGGING_LEVEL: v.optional(
        v.enum(LOGGING_LEVELS),
        LOGGING_LEVELS.info,
    ),

    SERVER_HOST: v.optional(hostname, "localhost"),
    SERVER_PORT: v.optional(number, "3333"),

    SECRET_KEY: cryptographicKey,
    SECRET_SALT: cryptographicKey,

    DATABASE_FILE_PATH: v.optional(filePath, "./data/database/db.sqlite"),

    UPLOADS_DIRECTORY_PATH: v.optional(directoryPath, "./data/uploads"),
    UPLOADS_MAX_FILE_SIZE: v.optional(byteSize, "5MB"),

    ARTICLES_ATTACHMENTS_MAX_FILE_SIZE: v.optional(byteSize, "5MB"),

    EVENTS_ATTACHMENTS_MAX_FILE_SIZE: v.optional(byteSize, "5MB"),

    SMTP_HOST: hostname,
    SMTP_PORT: number,

    SMTP_EMAIL: email,
    SMTP_PASSWORD: v.pipe(v.string(), secret()),

    APP_NAME: v.optional(
        v.pipe(v.string(), v.nonEmpty(), v.maxLength(32)),
        "Orital Ypiretis",
    ),
    APP_URL: v.optional(url, "http://localhost:3333"),

    ACCOUNT_PROVIDER_DOMAIN: domain,
    ACCOUNT_PROVIDER_NAME: v.pipe(v.string(), v.nonEmpty(), v.maxLength(64)),

    ACCOUNT_ADMIN_IDENTIFIERS: identifierList,

    SESSION_EPHEMERAL_TTL: v.optional(duration, "PT2H"),
    SESSION_PERSISTENT_TTL: v.optional(duration, "P30D"),

    TOKEN_CALLBACK_TTL: v.optional(duration, "PT5M"),
    TOKEN_CONSENT_TTL: v.optional(duration, "PT5M"),
    TOKEN_GRANT_TTL: v.optional(duration, "PT5M"),

    ROOMS_DISCONNECT_TTL: v.optional(duration, "PT1H"),
    ROOMS_LIFETIME_TTL: v.optional(duration, "PT24H"),

    CRONJOB_ROOMS_DISCONNECT_CLEANUP: v.optional(
        cronExpression,
        "*/25 * * * *",
    ),
    CRONJOB_ROOMS_LIFETIME_CLEANUP: v.optional(cronExpression, "0 */6 * * *"),
    CRONJOB_TOKENS_CLEANUP: v.optional(cronExpression, "*/10 * * * *"),

    QUEUE_EMAILS_MAX: v.optional(number, "10"),

    DISCORD_INVITE_CODE: alphanumerical,

    DISCOVER_EAST_ORGANIZATION_IDENTIFIER: identifier,

    GITHUB_ORGANIZATION_IDENTIFIER: identifier,
});
export type IEnvironmentSchema = v.InferInput<typeof ENVIRONMENT_SCHEMA>;

export type IEnvironmentParsed = v.InferOutput<typeof ENVIRONMENT_SCHEMA>;

export type ILoggingLevels =
    (typeof LOGGING_LEVELS)[keyof typeof LOGGING_LEVELS];

export type INodeEnvironmentModes =
    (typeof NODE_ENVIRONMENT_MODES)[keyof typeof NODE_ENVIRONMENT_MODES];

const {
    issues,
    output: ENVIRONMENT,
    success,
} = v.safeParse(ENVIRONMENT_SCHEMA, process.env);

if (!success) {
    console.error(
        "An error occurred while processing the environment variables:",
    );

    for (const issue of issues) {
        const {expected, path, message} = issue;

        const key = path
            ? path
                  .map((pathItem) => {
                      const {key} = pathItem;

                      return key;
                  })
                  .join(".")
            : expected;

        console.error(`${key}: ${message}`);
    }

    exit(1);
}

export default ENVIRONMENT as IEnvironmentParsed;
