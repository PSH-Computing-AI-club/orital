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

import type {
    IEventSourceMessage,
    IEventSourceOptions,
} from "~/hooks/event_source";
import useEventSource, {IEventSourceInit} from "~/hooks/event_source";
import withHashLoader from "~/hooks/hash_loader";
import useTimeout from "~/hooks/timeout";

import {token} from "~/utils/valibot";

import type {
    ILoginAuthorizedEvent,
    ILoginEventNames,
} from "./authentication_.log-in_.events";

import {Route} from "./+types/authentication.log-in.pending";

const CLIENT_LOADER_SCHEMA = v.object({
    callbackToken: v.pipe(v.string(), token("TCLB")),

    callbackTokenExpiresAt: v.pipe(
        v.string(),
        v.transform((value) => parseInt(value, 10)),
        v.number(),
    ),
});

export async function loader(loaderArgs: Route.LoaderArgs) {
    const {request} = loaderArgs;

    await requireGuestSession(request);
}

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
        CLIENT_LOADER_SCHEMA,
        Object.fromEntries(searchParams.entries()),
    );
});

export default function AuthenticationLogInPending() {
    const {callbackToken, callbackTokenExpiresAt} = useHashLoader() ?? {};

    const {pathname} = useLocation();
    const navigate = useNavigate();

    const onOpen = useCallback(
        async (response: Response) => {
            if (!response.ok) {
                // **TODO:** Can we force navigation to a route error boundary?
                // Also, we want to differentiate between status 401 and others.
                navigate("/authentication/log-in/unauthorized", {
                    replace: true,
                });
            }
        },
        [navigate],
    );

    const onMessage = useCallback(
        async (message: IEventSourceMessage) => {
            const {data, event} = message;

            switch (event as ILoginEventNames) {
                case "authorized":
                    const {grantToken} = JSON.parse(
                        data,
                    ) as ILoginAuthorizedEvent;

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

                case "revoked":
                    navigate("/authentication/log-in/revoked", {
                        replace: true,
                    });

                    break;
            }
        },
        [navigate, pathname],
    );

    const eventSourceOptions = useMemo<IEventSourceOptions>(
        () => ({
            enabled: !!callbackToken,

            onmessage: onMessage,
            onopen: onOpen,
        }),

        [callbackToken, onMessage, onOpen],
    );

    const eventSourceInit = useMemo<IEventSourceInit>(
        () => ({
            headers: {
                Authorization: `Bearer ${callbackToken}`,
            },
        }),
        [callbackToken],
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

    useEventSource(
        "/authentication/log-in/events",
        eventSourceOptions,
        eventSourceInit,
    );

    return (
        <PromptShell title="Log-In Pending." query="Pending">
            <noscript>
                <Text>
                    JavaScript is <Strong color="red.solid">required</Strong> to
                    log-in.
                </Text>
            </noscript>

            <Text>
                Check your email for the{" "}
                <Strong color="cyan.solid">log-in link</Strong>.
            </Text>

            <Text>Awaiting pending authorization...</Text>
        </PromptShell>
    );
}
