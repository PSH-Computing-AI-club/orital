import {Strong, Text} from "@chakra-ui/react";

import {requireGuestSession} from "~/.server/services/users_service";

import PromptShell from "~/components/shell/prompt_shell";

import {APP_NAME} from "~/utils/constants";

import type {Route} from "./+types/authentication.consent.authorized";

export async function loader(loaderArgs: Route.LoaderArgs) {
    const {request} = loaderArgs;

    await requireGuestSession(request);
}

export default function AuthenticationConsentAuthorized() {
    return (
        <PromptShell
            title="Login Authorized."
            query="Authorized"
            color="green.solid"
        >
            <Text>
                You have <Strong color="green.solid">authorized</Strong> the
                login into {APP_NAME}.
            </Text>

            <Text>
                You may safely close this page and return to your original
                browser window.
            </Text>
        </PromptShell>
    );
}
