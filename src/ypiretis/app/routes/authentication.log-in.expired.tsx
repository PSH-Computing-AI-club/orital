import {Link, Strong, Text} from "@chakra-ui/react";

import {requireGuestSession} from "~/.server/services/users_service";

import PromptShell from "~/components/shell/prompt_shell";

import {wrapMetaFunction} from "~/utils/meta";

import type {Route} from "./+types/authentication.log-in.expired";

const TITLE = "Login Expired.";

const QUERY = "Expired";

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

export default function AuthenticationLogInExpired() {
    return (
        <PromptShell title={TITLE} query={QUERY} color="red.solid">
            <Text>
                The login you were trying to handle has{" "}
                <Strong color="red.solid">expired</Strong>.
            </Text>

            <Text>
                Return to the{" "}
                <Link
                    href="/authentication/log-in"
                    variant="underline"
                    color="blue.solid"
                >
                    log-in
                </Link>{" "}
                page to log-in again.
            </Text>
        </PromptShell>
    );
}
