import {Strong, Text} from "@chakra-ui/react";

import {useCallback, useMemo} from "react";

import {data, useLocation, useNavigate} from "react-router";

import * as v from "valibot";

import {lookupAccountID} from "~/.server/services/directory_service";
import {
    deleteOne as deleteOneGrantToken,
    requireTokenBearer,
} from "~/.server/services/grant_tokens_service";
import {
    findOneByAccountID as findOneUserByAccountID,
    insertOne as insertOneUser,
    requireGuestSession,
    getGrantHeader,
} from "~/.server/services/users_service";

import PromptShell from "~/components/shell/prompt_shell";

import type {IUseWebSocketOptions} from "~/hooks/web_socket";
import useWebSocket, {WebSocketCacheProvider} from "~/hooks/web_socket";
import withHashLoader from "~/hooks/hash_loader";
import useTimeout from "~/hooks/timeout";

import {buildWebSocketURL} from "~/utils/url";
import {token} from "~/utils/valibot";

import type {ILoginEvents} from "./authentication_.log-in_.events";

import {Route} from "./+types/authentication.log-in.pending";

const HASH_LOADER_HASH_SCHEMA = v.object({
    callbackToken: v.pipe(v.string(), token("TCLB")),

    callbackTokenExpiresAt: v.pipe(
        v.string(),
        v.transform((value) => parseInt(value, 10)),
        v.number(),
    ),
});

export async function action(actionArgs: Route.ActionArgs) {
    const {request} = actionArgs;

    const {accountID, id: grantTokenID} = await requireTokenBearer(request);
    const {session} = await requireGuestSession(request);

    let user = await findOneUserByAccountID(accountID);

    if (user === null) {
        const {firstName, lastName} = await lookupAccountID(accountID);

        user = await insertOneUser({
            accountID,
            firstName,
            lastName,
        });
    }

    session.set("userID", user.id);

    const cookie = await getGrantHeader(request, session);

    await deleteOneGrantToken(grantTokenID);

    return data("", {
        headers: {
            "Set-Cookie": cookie,
        },
    });
}

const useHashLoader = withHashLoader((hash) => {
    const searchParams = new URLSearchParams(hash);

    return v.parse(
        HASH_LOADER_HASH_SCHEMA,
        Object.fromEntries(searchParams.entries()),
    );
});

function AuthenticationLogInPendingView(props: {
    callbackToken?: string;
    callbackTokenExpiresAt?: number;
}) {
    const {callbackToken, callbackTokenExpiresAt} = props;

    const {pathname} = useLocation();
    const navigate = useNavigate();

    const onError = useCallback((event: Event) => {
        // **TODO:** handle error here somehow

        console.error(event);
    }, []);

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

                    if (!response.ok) {
                        // **TODO:** Can we force navigation to a route error boundary?
                        // Also, we want to differentiate between status 401 and others.
                        navigate("/authentication/log-in/unauthorized", {
                            replace: true,
                        });
                    }

                    navigate("/", {
                        replace: true,
                    });

                    break;
                }

                case "revoked":
                    navigate("/authentication/log-in/revoked", {
                        replace: true,
                    });

                    break;
            }
        },
        [navigate, pathname],
    );

    const useWebSocketOptions = useMemo<IUseWebSocketOptions>(
        () => ({
            onError,
            onMessage,
            // **HACK:** Just know, this is a massive awful hack to bypass
            // sending our token over query params.
            protocols: `Bearer ${callbackToken}`,
        }),

        [callbackToken, onError, onMessage],
    );

    useTimeout(
        () => {
            navigate("/authentication/log-in/expired", {
                replace: true,
            });
        },

        {
            duration: (callbackTokenExpiresAt ?? 0) - Date.now(),
            enabled: !!callbackTokenExpiresAt,
        },
    );

    useWebSocket(
        buildWebSocketURL("/authentication/log-in/events"),
        useWebSocketOptions,
    );

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

export default function AuthenticationLogInPending() {
    const {callbackToken, callbackTokenExpiresAt} = useHashLoader() ?? {};

    return (
        <WebSocketCacheProvider>
            <AuthenticationLogInPendingView
                callbackToken={callbackToken}
                callbackTokenExpiresAt={callbackTokenExpiresAt}
            />
        </WebSocketCacheProvider>
    );
}
