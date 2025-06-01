import {Strong, Text} from "@chakra-ui/react";

import {requireGuestSession} from "~/.server/services/users_service";

import PromptShell from "~/components/shell/prompt_shell";

import {APP_NAME} from "~/utils/constants";

import {wrapMetaFunction} from "~/utils/meta";

import type {Route} from "./+types/authentication.consent.revoked";

const TITLE = "Login Revoked.";

const QUERY = "Revoked";

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

export default function AuthenticationConsentRevoked() {
    return (
        <PromptShell title={TITLE} query={QUERY} color="red.solid">
            <Text>
                You have <Strong color="red.solid">revoked</Strong> the login
                into {APP_NAME}.
            </Text>

            <Text>
                You may safely close this page and return to your original
                browser window if you wish to log-in again.
            </Text>
        </PromptShell>
    );
}
