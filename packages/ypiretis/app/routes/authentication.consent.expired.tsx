import {Strong, Text} from "@chakra-ui/react";

import {requireGuestSession} from "~/.server/services/users_service";

import PromptShell from "~/components/shell/prompt_shell";

import {wrapMetaFunction} from "~/utils/meta";

import type {Route} from "./+types/authentication.consent.expired";

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

export default function AuthenticationConsentExpired() {
    return (
        <PromptShell title={TITLE} query={QUERY} color="red.solid">
            <Text>
                The login you are trying to handle has{" "}
                <Strong color="red.solid">expired</Strong>.
            </Text>

            <Text>
                You may safely close this page and return to your original
                browser window if you wish to log-in again.
            </Text>
        </PromptShell>
    );
}
