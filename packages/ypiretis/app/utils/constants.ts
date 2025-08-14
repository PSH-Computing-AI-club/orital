// **IMPORTANT:** Do **NOT** use absolute imports in this module. It is
// imported by server-only modules.

export const APP_IS_PRODUCTION = import.meta.env.PROD;

export const APP_NAME = __APP_NAME__;

export const APP_REPOSITORY_URL = new URL(__APP_REPOSITORY_URL__);

export const APP_URL = new URL(__APP_URL__);

export const ACCOUNT_PROVIDER_DOMAIN = __ACCOUNT_PROVIDER_DOMAIN__;

export const ACCOUNT_PROVIDER_NAME = __ACCOUNT_PROVIDER_NAME__;

export const ARTICLES_ATTACHMENTS_MAX_FILE_SIZE = Math.min(
    __ARTICLES_ATTACHMENTS_MAX_FILE_SIZE__,
    __UPLOADS_MAX_FILE_SIZE__,
);

export const EVENTS_ATTACHMENTS_MAX_FILE_SIZE = Math.min(
    __EVENTS_ATTACHMENTS_MAX_FILE_SIZE__,
    __UPLOADS_MAX_FILE_SIZE__,
);

export const IS_CLIENT = !import.meta.env.SSR;

export const IS_SERVER = !IS_CLIENT;

export const PACKAGE_NAME = __PACKAGE_NAME__;

export const PACKAGE_VERSION = __PACKAGE_VERSION__;

export const SERVER_TIMEZONE = __SERVER_TIMEZONE__;
