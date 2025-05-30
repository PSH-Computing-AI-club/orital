import {APP_URL} from "./constants";

export function buildAppURL(url: URL | string): URL {
    return new URL(url, APP_URL);
}
