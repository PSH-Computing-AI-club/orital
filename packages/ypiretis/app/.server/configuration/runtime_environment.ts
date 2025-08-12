import * as v from "valibot";

import {
    alphanumerical,
    email,
    identifier,
    identifierList,
    number,
} from "../../utils/valibot";

import {parseEnvironment} from "../utils/environment";
import {
    cronExpression,
    cryptographicKey,
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

export const RUNTIME_ENVIRONMENT_SCHEMA = v.object({
    SERVER_LOGGING_LEVEL: v.optional(
        v.enum(LOGGING_LEVELS),
        LOGGING_LEVELS.info,
    ),

    SECRET_KEY: cryptographicKey,
    SECRET_SALT: cryptographicKey,

    DATABASE_FILE_PATH: v.optional(filePath, "./data/database/db.sqlite"),

    UPLOADS_DIRECTORY_PATH: v.optional(directoryPath, "./data/uploads"),

    SMTP_HOST: hostname,
    SMTP_PORT: number,

    SMTP_EMAIL: email,
    SMTP_PASSWORD: v.pipe(v.string(), secret()),

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
export type IRuntimeEnvironmentSchema = v.InferInput<
    typeof RUNTIME_ENVIRONMENT_SCHEMA
>;

export type IRuntimeEnvironmentParsed = v.InferOutput<
    typeof RUNTIME_ENVIRONMENT_SCHEMA
>;

export type ILoggingLevels =
    (typeof LOGGING_LEVELS)[keyof typeof LOGGING_LEVELS];

const RUNTIME_ENVIRONMENT = parseEnvironment(RUNTIME_ENVIRONMENT_SCHEMA);
export default RUNTIME_ENVIRONMENT;
