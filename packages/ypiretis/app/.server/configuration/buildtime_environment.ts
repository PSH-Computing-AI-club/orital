import * as v from "valibot";

import {NAVIGATOR_TIMEZONE} from "../../utils/navigator";
import {number, url} from "../../utils/valibot";

import {parseEnvironment} from "../utils/environment";
import {byteSize, cryptographicKey, domain, hostname} from "../utils/valibot";

export const BUILDTIME_ENVIRONMENT_SCHEMA = v.object({
    SERVER_TIMEZONE: v.optional(v.string(), NAVIGATOR_TIMEZONE),

    SERVER_HOST: v.optional(hostname, "localhost"),
    SERVER_PORT: v.optional(number, "3333"),

    SECRET_KEY: cryptographicKey,
    SECRET_SALT: cryptographicKey,

    UPLOADS_MAX_FILE_SIZE: v.optional(byteSize, "5MB"),

    ARTICLES_ATTACHMENTS_MAX_FILE_SIZE: v.optional(byteSize, "5MB"),

    EVENTS_ATTACHMENTS_MAX_FILE_SIZE: v.optional(byteSize, "5MB"),

    APP_NAME: v.optional(
        v.pipe(v.string(), v.nonEmpty(), v.maxLength(32)),
        "Orital Ypiretis",
    ),
    APP_REPOSITORY_URL: url,
    APP_URL: v.optional(url, "http://localhost:3333"),

    ACCOUNT_PROVIDER_DOMAIN: domain,
    ACCOUNT_PROVIDER_NAME: v.pipe(v.string(), v.nonEmpty(), v.maxLength(64)),
});

export type IBuildtimeEnvironmentSchema = v.InferInput<
    typeof BUILDTIME_ENVIRONMENT_SCHEMA
>;

export type IBuildtimeEnvironmentParsed = v.InferOutput<
    typeof BUILDTIME_ENVIRONMENT_SCHEMA
>;

const BUILDTIME_ENVIRONMENT = parseEnvironment(BUILDTIME_ENVIRONMENT_SCHEMA);
export default BUILDTIME_ENVIRONMENT;
