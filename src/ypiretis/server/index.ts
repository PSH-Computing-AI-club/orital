import {createRequestHandler} from "react-router";

import DATABASE from "~/.server/configuration/database";

import startCronjobs from "~/.server/cronjobs";

import "react-router";

declare module "react-router" {
    interface AppLoadContext {}
}

const disposeCronjobs = startCronjobs();

export const REQUEST_HANDLER = createRequestHandler(
    () => import("virtual:react-router/server-build"),
);

export function shutdown() {
    disposeCronjobs();
    DATABASE.$client.close();
}
