import {reactRouter} from "@react-router/dev/vite";

import {reactRouterHonoServer} from "react-router-hono-server/dev";

import {defineConfig} from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

import PACKAGE from "./package.json";

import BUILDTIME_ENVIRONMENT from "./app/.server/configuration/buildtime_environment";

import TSCONFIG from "./tsconfig.json";

const {
    ACCOUNT_PROVIDER_DOMAIN,
    ACCOUNT_PROVIDER_NAME,
    APP_NAME,
    APP_URL,
    ARTICLES_ATTACHMENTS_MAX_FILE_SIZE,
    EVENTS_ATTACHMENTS_MAX_FILE_SIZE,
    NODE_ENV,
    SERVER_HOST,
    SERVER_PORT,
    SERVER_TIMEZONE,
    UPLOADS_MAX_FILE_SIZE,
} = BUILDTIME_ENVIRONMENT;

const {name: PACKAGE_NAME, version: PACKAGE_VERSION} = PACKAGE;

export default defineConfig((config) => {
    const {command, isSsrBuild} = config;

    return {
        build: {
            target: TSCONFIG.compilerOptions.target,

            rollupOptions: isSsrBuild
                ? {
                      input: "./server/index.ts",
                  }
                : undefined,
        },

        define: {
            __ACCOUNT_PROVIDER_DOMAIN__: JSON.stringify(
                ACCOUNT_PROVIDER_DOMAIN,
            ),
            __ACCOUNT_PROVIDER_NAME__: JSON.stringify(ACCOUNT_PROVIDER_NAME),
            __APP_NAME__: JSON.stringify(APP_NAME),
            __APP_URL__: JSON.stringify(APP_URL),
            __APP_IS_PRODUCTION__: JSON.stringify(NODE_ENV === "production"),
            __ARTICLES_ATTACHMENTS_MAX_FILE_SIZE__: JSON.stringify(
                ARTICLES_ATTACHMENTS_MAX_FILE_SIZE,
            ),
            __EVENTS_ATTACHMENTS_MAX_FILE_SIZE__: JSON.stringify(
                EVENTS_ATTACHMENTS_MAX_FILE_SIZE,
            ),
            __PACKAGE_NAME__: JSON.stringify(PACKAGE_NAME),
            __PACKAGE_VERSION__: JSON.stringify(PACKAGE_VERSION),
            __SERVER_TIMEZONE__: JSON.stringify(SERVER_TIMEZONE),
            __UPLOADS_MAX_FILE_SIZE__: JSON.stringify(UPLOADS_MAX_FILE_SIZE),
        },

        resolve:
            // **HACK:** This is to resolve a Bun-related compatibility issue.
            // SOURCE: https://github.com/remix-run/react-router/issues/12568
            command === "build"
                ? {
                      alias: {
                          "react-dom/server": "react-dom/server.node",
                      },
                  }
                : undefined,

        plugins: [
            reactRouterHonoServer({
                runtime: "bun",
            }),

            reactRouter(),
            tsconfigPaths(),
        ],

        server: {
            host: SERVER_HOST,
            port: SERVER_PORT,
        },
    };
});
