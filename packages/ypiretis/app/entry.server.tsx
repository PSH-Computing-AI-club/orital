import {Readable as NodeJSReadable, PassThrough} from "node:stream";

import createEmotionCache from "@emotion/cache";
import {CacheProvider} from "@emotion/react";

import createEmotionServer from "@emotion/server/create-instance";

import {isbot} from "isbot";

import type {RenderToPipeableStreamOptions} from "react-dom/server";
import {renderToPipeableStream} from "react-dom/server";

import type {AppLoadContext, EntryContext} from "react-router";
import {ServerRouter} from "react-router";

import DATABASE from "~/.server/configuration/database";

import startCronjobs from "~/.server/cronjobs";

const disposeCronjobs = startCronjobs();

export const streamTimeout = 5_000;

export default function handleRequest(
    request: Request,
    responseStatusCode: number,
    responseHeaders: Headers,
    routerContext: EntryContext,
    _loadContext: AppLoadContext,
    // If you have middleware enabled:
    // loadContext: unstable_RouterContextProvider
) {
    return new Promise((resolve, reject) => {
        const emotionCache = createEmotionCache({key: "css"});
        const userAgent = request.headers.get("user-agent");

        // Ensure requests from bots and SPA Mode renders wait for all content to load before responding
        // https://react.dev/reference/react-dom/server/renderToPipeableStream#waiting-for-all-content-to-load-for-crawlers-and-static-generation
        const readyOption: keyof RenderToPipeableStreamOptions =
            (userAgent && isbot(userAgent)) || routerContext.isSpaMode
                ? "onAllReady"
                : "onShellReady";

        let shellRendered = false;

        const {pipe, abort} = renderToPipeableStream(
            <CacheProvider value={emotionCache}>
                <ServerRouter context={routerContext} url={request.url} />
            </CacheProvider>,
            {
                [readyOption]() {
                    shellRendered = true;

                    const body = new PassThrough();
                    const emotionServer = createEmotionServer(emotionCache);

                    const bodyWithStyles =
                        emotionServer.renderStylesToNodeStream();

                    body.pipe(bodyWithStyles);

                    const stream = NodeJSReadable.toWeb(
                        // @ts-expect-error - **HACK:** Believe in the typing asserted
                        // below... it MUST be true!
                        bodyWithStyles,
                    ) as unknown as ReadableStream<Uint8Array<ArrayBufferLike>>;

                    responseHeaders.set("Content-Type", "text/html");

                    resolve(
                        new Response(stream, {
                            headers: responseHeaders,
                            status: responseStatusCode,
                        }),
                    );

                    pipe(body);
                },

                onShellError(error: unknown) {
                    reject(error);
                },

                onError(error: unknown) {
                    responseStatusCode = 500;
                    // Log streaming rendering errors from inside the shell.  Don't log
                    // errors encountered during initial shell rendering since they'll
                    // reject and get logged in handleDocumentRequest.
                    if (shellRendered) {
                        console.error(error);
                    }
                },
            },
        );

        // Abort the rendering stream after the `streamTimeout` so it has time to
        // flush down the rejected boundaries
        setTimeout(abort, streamTimeout + 1000);
    });
}

function onTerminate(): void {
    disposeCronjobs();
    DATABASE.$client.close();

    process.exit(0);
}

process.on("SIGINT", onTerminate);
process.on("SIGTERM", onTerminate);
