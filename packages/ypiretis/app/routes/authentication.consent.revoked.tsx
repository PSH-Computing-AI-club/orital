import {Strong, Text} from "@chakra-ui/react";

import {requireGuestSession} from "~/.server/services/users_service";

import PromptShell from "~/components/shell/prompt_shell";

import {APP_NAME} from "~/utils/constants";

import type {Route} from "./+types/authentication.consent.revoked";

export async function loader(loaderArgs: Route.LoaderArgs) {
    const {request} = loaderArgs;

    await requireGuestSession(request);
}

export default function AuthenticationConsentRevoked() {
    return (
        <PromptShell title="Login Revoked." query="Revoked" color="red.solid">
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
