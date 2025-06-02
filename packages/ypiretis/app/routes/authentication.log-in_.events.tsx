import {eventStream} from "remix-utils/sse/server";

import {requireTokenBearer} from "~/.server/services/callback_tokens_service";
import {
    EVENT_CONSENT_AUTHORIZED,
    EVENT_CONSENT_REVOKED,
} from "~/.server/services/consent_tokens_service";
import {requireGuestSession} from "~/.server/services/users_service";

import type {Route} from "./+types/authentication.log-in_.events";

export type ILoginEventNames = "authorized" | "revoked";

export interface ILoginAuthorizedEvent {
    readonly grantToken: string;

    readonly grantTokenExpiresAt: number;
}

export type ILoginRevokedEvent = null;

export async function loader(loaderArgs: Route.LoaderArgs) {
    const {request} = loaderArgs;

    await requireGuestSession(request);

    const {signal} = request;

    const {id} = await requireTokenBearer(request);

    return eventStream(signal, (send, abort) => {
        const authorizedSubscription = EVENT_CONSENT_AUTHORIZED.subscribe(
            async (event) => {
                const {callbackTokenID, grantToken, grantTokenExpiresAt} =
                    event;

                if (callbackTokenID === id) {
                    send({
                        event: "authorized" satisfies ILoginEventNames,
                        data: JSON.stringify({
                            grantToken: grantToken.expose(),
                            grantTokenExpiresAt:
                                grantTokenExpiresAt.epochMilliseconds,
                        } satisfies ILoginAuthorizedEvent),
                    });

                    abort();
                }
            },
        );

        const revokedSubscription = EVENT_CONSENT_REVOKED.subscribe(() => {
            send({
                event: "revoked" satisfies ILoginEventNames,
                data: JSON.stringify(null satisfies ILoginRevokedEvent),
            });

            abort();
        });

        return () => {
            authorizedSubscription.dispose();
            revokedSubscription.dispose();
        };
    });
}
