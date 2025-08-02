import {Strong, Text} from "@chakra-ui/react";

import {useCallback, useMemo} from "react";

import type {ShouldRevalidateFunction} from "react-router";
import {data, useLocation, useNavigate} from "react-router";

import * as v from "valibot";

import {eq} from "~/.server/services/crud_service.filters";
import {lookupAccountID} from "~/.server/services/directory_service";
import {
    deleteOne as deleteOneGrantToken,
    requireTokenBearer,
} from "~/.server/services/grant_tokens_service";
import {
    findOne as findOneUser,
    insertOne as insertOneUser,
    requireGuestSession,
    getGrantHeaders,
} from "~/.server/services/users_service";

import TimeDeltaText from "~/components/common/time_delta_text";
import PromptShell from "~/components/shell/prompt_shell";

import {validateSearchParams} from "~/guards/validation";

import type {IUseWebSocketOptions} from "~/hooks/web_socket";
import useWebSocket, {WebSocketCacheProvider} from "~/hooks/web_socket";
import type {IUseTimeoutOptions} from "~/hooks/timeout";
import useTimeout from "~/hooks/timeout";

import {buildWebSocketURL} from "~/utils/url";

import type {ILoginEvents} from "./authentication_.log-in_.events";

import {number} from "~/utils/valibot";

import {Route} from "./+types/authentication_.log-in.pending";

const LOADER_SEARCH_PARAMS_SCHEMA = v.object({
    callbackTokenExpiresAt: number,
});

export const shouldRevalidate = ((_revalidateArgs) => {
    return false;
}) satisfies ShouldRevalidateFunction;

export async function action(actionArgs: Route.ActionArgs) {
    const {accountID, id: grantTokenID} = await requireTokenBearer(actionArgs);
    const {session} = await requireGuestSession(actionArgs);

    let user = await findOneUser({
        where: eq("accountID", accountID),
    });

    if (user === null) {
        const {firstName, lastName} = await lookupAccountID(accountID);

        user = await insertOneUser({
            values: {
                accountID,
                firstName,
                lastName,
            },
        });
    }

    session.set("userID", user.id);

    const headers = await getGrantHeaders(actionArgs, session);

    await deleteOneGrantToken(grantTokenID);

    return data("", {
        headers,
    });
}

export function clientLoader(loaderArgs: Route.ClientLoaderArgs) {
    const {callbackTokenExpiresAt} = validateSearchParams(
        LOADER_SEARCH_PARAMS_SCHEMA,
        loaderArgs,
    );

    return {
        callbackTokenExpiresAt,
    };
}

clientLoader.hydrate = true as const;

export function HydrateFallback() {
    return (
        <>
            <PromptShell.Title title="Log-In Pending." query="Pending" />

            <PromptShell.Body>
                <noscript>
                    <Text>
                        JavaScript is{" "}
                        <Strong color="red.solid">required</Strong> to log-in.
                    </Text>
                </noscript>

                <Text>
                    Check your email for the{" "}
                    <Strong color="cyan.solid">log-in link</Strong>.
                </Text>

                <Text>Awaiting pending authorization...</Text>
            </PromptShell.Body>
        </>
    );
}

function AuthenticationLogInPendingView(props: {
    callbackTokenExpiresAt: number;
}) {
    const {callbackTokenExpiresAt} = props;

    const {pathname} = useLocation();
    const navigate = useNavigate();

    const onClose = useCallback(
        (event: CloseEvent) => {
            const {code} = event;

            if (code !== 1000) {
                // **HACK:** We need to let the browser fully close the web socket
                // before we perform a navigation. Otherwise, the browser will hang
                // with the dangling web socket connection.
                setTimeout(async () => {
                    // **TODO:** Can we force navigation to a route error boundary?
                    // Also, we want to differentiate between status 401 and others.
                    await navigate("/authentication/log-in/unauthorized", {
                        replace: true,
                    });
                }, 0);
            }
        },
        [navigate],
    );

    const onMessage = useCallback(
        async (event: MessageEvent) => {
            const message = JSON.parse(event.data) as ILoginEvents;

            switch (message.event) {
                case "authorized": {
                    const {grantToken} = message.data;

                    // **HACK:** I would use RRv7's `useFetcher` API here but...
                    // it does not support setting headers. And we want to user
                    // bearer tokens when possible.

                    const response = await fetch(pathname, {
                        method: "POST",

                        headers: {
                            Authorization: `Bearer ${grantToken}`,
                        },
                    });

                    if (response.ok) {
                        await navigate("/", {
                            replace: true,
                        });
                    } else {
                        // **TODO:** Can we force navigation to a route error boundary?
                        // Also, we want to differentiate between status 401 and others.
                        await navigate("/authentication/log-in/unauthorized", {
                            replace: true,
                        });
                    }

                    break;
                }

                case "revoked":
                    await navigate("/authentication/log-in/revoked", {
                        replace: true,
                    });

                    break;
            }
        },
        [navigate, pathname],
    );

    const onTimeout = useCallback(() => {
        navigate("/authentication/log-in/expired", {
            replace: true,
        });
    }, [navigate]);

    const useWebSocketOptions = useMemo<IUseWebSocketOptions>(
        () => ({
            onClose,
            onMessage,
        }),

        [onClose, onMessage],
    );

    const useTimeoutOptions = useMemo<IUseTimeoutOptions>(
        () => ({
            onTimeout,
            duration: callbackTokenExpiresAt - Date.now(),
        }),
        [callbackTokenExpiresAt, onTimeout],
    );

    const connectionURL = useMemo<URL>(
        () => buildWebSocketURL("/authentication/log-in/events"),
        [],
    );

    useTimeout(useTimeoutOptions);

    useWebSocket(connectionURL, useWebSocketOptions);

    return (
        <>
            <PromptShell.Title title="Log-In Pending." query="Pending" />

            <PromptShell.Body>
                <Text color="red.fg">
                    This login will expire in{" "}
                    <TimeDeltaText endMilliseconds={callbackTokenExpiresAt} />.
                </Text>

                <Text>
                    Check your email for the{" "}
                    <Strong color="cyan.solid">log-in link</Strong>.
                </Text>

                <Text>Awaiting pending authorization...</Text>
            </PromptShell.Body>
        </>
    );
}

export default function AuthenticationLogInPending(
    props: Route.ComponentProps,
) {
    const {loaderData} = props;
    const {callbackTokenExpiresAt} = loaderData;

    return (
        <WebSocketCacheProvider>
            <AuthenticationLogInPendingView
                callbackTokenExpiresAt={callbackTokenExpiresAt}
            />
        </WebSocketCacheProvider>
    );
}
