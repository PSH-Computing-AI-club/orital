import {Strong, Text} from "@chakra-ui/react";

import {requireGuestSession} from "~/.server/services/users_service";

import PromptShell from "~/components/shell/prompt_shell";

import type {Route} from "./+types/authentication.consent.expired";

export async function loader(loaderArgs: Route.LoaderArgs) {
    const {request} = loaderArgs;

    await requireGuestSession(request);
}

export default function AuthenticationConsentExpired() {
    return (
        <PromptShell title="Login Expired." query="Expired." color="red.solid">
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
