import {BEARER_TYPES} from "~/.server/guards/guard";

import {requireTokenBearer} from "~/.server/services/callback_tokens_service";
import {
    EVENT_CONSENT_AUTHORIZED,
    EVENT_CONSENT_REVOKED,
} from "~/.server/services/consent_tokens_service";

import {webSocket} from "~/.server/utils/web_socket";

import type {Route} from "./+types/authentication_.log-in_.events";

export type ILoginEvents = ILoginAuthorizedEvent | ILoginRevokedEvent;

export interface ILoginAuthorizedEvent {
    readonly event: "authorized";

    readonly data: {
        readonly grantToken: string;

        readonly grantTokenExpiresAt: number;
    };
}

export interface ILoginRevokedEvent {
    readonly event: "revoked";
}

export async function loader(loaderArgs: Route.LoaderArgs) {
    const {request} = loaderArgs;

    const {id} = await requireTokenBearer(request, {
        bearerType: BEARER_TYPES.cookie,
    });

    let destructor: (() => void) | null = null;

    webSocket({
        onClose(_event, _connection) {
            if (destructor) {
                destructor();
            }
        },

        onOpen(_event, connection) {
            const authorizedSubscription = EVENT_CONSENT_AUTHORIZED.subscribe(
                (event) => {
                    const {callbackTokenID, grantToken, grantTokenExpiresAt} =
                        event;

                    if (callbackTokenID === id) {
                        connection.send(
                            JSON.stringify({
                                event: "authorized",

                                data: {
                                    grantToken: grantToken.expose(),
                                    grantTokenExpiresAt:
                                        grantTokenExpiresAt.epochMilliseconds,
                                },
                            } satisfies ILoginAuthorizedEvent),
                        );

                        connection.close(1000, "Normal Closure");
                    }
                },
            );

            const revokedSubscription = EVENT_CONSENT_REVOKED.subscribe(
                (event) => {
                    const {callbackTokenID} = event;

                    if (callbackTokenID === id) {
                        connection.send(
                            JSON.stringify({
                                event: "revoked",
                            } satisfies ILoginRevokedEvent),
                        );

                        connection.close(1000, "Normal Closure");
                    }
                },
            );

            destructor = () => {
                authorizedSubscription.dispose();
                revokedSubscription.dispose();
            };
        },
    });
}
