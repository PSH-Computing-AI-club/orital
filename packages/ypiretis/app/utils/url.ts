// **IMPORTANT:** Do **NOT** use absolute imports in this module. It is
// imported by server-only modules.

import type {Location, To} from "react-router";

import {APP_URL} from "./constants";

const WEB_SOCKET_PROTOCOL = APP_URL.protocol === "http:" ? "ws://" : "wss://";

const WEB_SOCKET_URL = `${WEB_SOCKET_PROTOCOL}${APP_URL.host}${APP_URL.pathname}`;

export type IURLComponents =
    | {
          readonly hash?: string;

          readonly pathname?: string;

          readonly search: string;
      }
    | {
          readonly hash?: string;

          readonly pathname?: string;

          readonly searchParams?: URLSearchParams;
      };

export function buildAppURL(url: Location | To | URL | string): URL {
    if (url instanceof URL) {
        return url;
    } else if (typeof url === "object") {
        const {hash = "", pathname = "", search = ""} = url;

        return new URL(`${pathname}${search}${hash}`, APP_URL);
    }

    return new URL(url, APP_URL);
}

export function buildURLComponents(urlComponents: IURLComponents): string {
    let search =
        "search" in urlComponents
            ? (urlComponents.search ?? "")
            : (urlComponents.searchParams?.toString() ?? "");

    let {hash = "", pathname = ""} = urlComponents;

    if (hash.length > 0 && !hash.startsWith("#")) {
        hash = "#" + hash;
    }

    if (pathname.length > 0 && !pathname.startsWith("/")) {
        pathname = "/" + pathname;
    }

    if (search.length > 0 && !search.startsWith("?")) {
        search = "?" + search;
    }

    return `${pathname}${search}${hash}`;
}

export function buildWebSocketURL(url: string): URL {
    return new URL(url, WEB_SOCKET_URL);
}
