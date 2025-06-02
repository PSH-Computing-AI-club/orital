// **IMPORTANT:** Do **NOT** use absolute imports in this module. It is
// imported by server-only modules.

import {APP_URL} from "./constants";

export function buildAppURL(url: URL | string): URL {
    return new URL(url, APP_URL);
}
