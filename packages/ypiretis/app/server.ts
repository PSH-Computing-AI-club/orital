import {createHonoServer} from "react-router-hono-server/bun";

import BUILDTIME_ENVIRONMENT from "~/.server/configuration/buildtime_environment";

import type {IWSEvents, IWebSocketContext} from "./.server/state/web_socket";
import {WEBSOCKET_CONTEXT} from "./.server/state/web_socket";

const {SERVER_PORT} = BUILDTIME_ENVIRONMENT;

export default await createHonoServer({
    port: SERVER_PORT,

    useWebSocket: true,

    configure(app, helpers) {
        const {upgradeWebSocket} = helpers;

        app.use(async (context, next) => {
            let cachedEvents: IWSEvents | null = null;

            const websocketContext = {
                upgradeWebSockets(events) {
                    cachedEvents = events;
                },
            } satisfies IWebSocketContext;

            await WEBSOCKET_CONTEXT.run(websocketContext, async () => {
                await next();

                if (cachedEvents !== null) {
                    const webSocketMiddleware = upgradeWebSocket(
                        (_upgradeContext) => cachedEvents!,
                    );

                    webSocketMiddleware(context, next);
                }
            });
        });
    },
});

declare module "react-router" {
    interface AppLoadContext {}
}
