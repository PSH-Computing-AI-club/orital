// **IMPORTANT:** Do **NOT** use absolute imports in this module. It is
// imported by server-only modules.

export const APP_IS_PRODUCTION = __APP_IS_PRODUCTION__;

export const APP_NAME = __APP_NAME__;

export const APP_URL = new URL(__APP_URL__);

export const ACCOUNT_PROVIDER_DOMAIN = __ACCOUNT_PROVIDER_DOMAIN__;

export const ACCOUNT_PROVIDER_NAME = __ACCOUNT_PROVIDER_NAME__;

export const IS_CLIENT = typeof window === "object";

export const IS_SERVER = !IS_CLIENT;

export const PACKAGE_NAME = __PACKAGE_NAME__;

export const PACKAGE_VERSION = __PACKAGE_VERSION__;
