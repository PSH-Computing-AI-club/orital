import {Strong, Text} from "@chakra-ui/react";

import {useEffect, useMemo} from "react";

import {data, useLocation, useNavigate} from "react-router";

import * as v from "valibot";

import {
    deleteOne as deleteOneGrantToken,
    requireTokenBearer,
} from "~/.server/services/grant_tokens_service";
import {lookupAccountID} from "~/.server/services/directory_service";
import {
    commitSession,
    getSession,
} from "~/.server/services/persistent_session_service";
import {
    findOneByAccountID as findOneUserByAccountID,
    insertOne as insertOneUser,
    requireGuestSession,
} from "~/.server/services/users_service";

import PromptShell from "~/components/shell/prompt_shell";

import type {IEventSourceOptions} from "~/hooks/event_source";
import useEventSource from "~/hooks/event_source";
import withHashLoader from "~/hooks/hash_loader";
import useTimeout from "~/hooks/timeout";

import {wrapMetaFunction} from "~/utils/meta";
import {token} from "~/utils/valibot";

import type {
    ILoginAuthorizedEvent,
    ILoginEventNames,
} from "./authentication.log-in.events";

import {Route} from "./+types/authentication.log-in.pending";

const TITLE = "Log-In Pending.";

const QUERY = "Pending";

const CLIENT_LOADER_SCHEMA = v.object({
    callbackToken: v.pipe(v.string(), token("TCLB")),

    callbackTokenExpiresAt: v.pipe(
        v.string(),
        v.transform((value) => parseInt(value, 10)),
        v.number(),
    ),
});

export const meta = wrapMetaFunction(() => {
    return [
        {
            title: TITLE,
        },
    ];
});

export function loader(loaderArgs: Route.LoaderArgs) {
    const {request} = loaderArgs;

    return requireGuestSession(request);
}

export async function action(actionArgs: Route.ActionArgs) {
    const {request} = actionArgs;

    await requireGuestSession(request);

    const {accountID, id: grantTokenID} = await requireTokenBearer(request);

    const cookieHeader = request.headers.get("Cookie");
    const session = await getSession(cookieHeader);

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

    const cookie = await commitSession(session);

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

    const eventSourceOptions = useMemo<IEventSourceOptions>(
        () => ({
            enabled: !!callbackToken,

            init: {
                headers: {
                    Authorization: `Bearer ${callbackToken}`,
                },

                async onopen(response) {
                    if (!response.ok) {
                        // **TODO:** Can we force navigation to a route error boundary?
                        // Also, we want to differentiate between status 401 and others.
                        navigate("/authentication/log-in/unauthorized", {
                            replace: true,
                        });
                    }
                },
            },
        }),

        [callbackToken],
    );

    const message = useEventSource(
        "/authentication/log-in/events",
        eventSourceOptions,
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

    useEffect(() => {
        if (!message) {
            return;
        }

        (async () => {
            switch (message.event as ILoginEventNames) {
                case "authorized":
                    // TODO: call route that sets session tokens

                    const {grantToken} = JSON.parse(
                        message.data,
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
        })();
    }, [message]);

    return (
        <PromptShell title={TITLE} query={QUERY}>
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
