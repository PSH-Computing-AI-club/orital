import {Link, Strong, Text} from "@chakra-ui/react";

import {requireGuestSession} from "~/.server/services/users_service";

import PromptShell from "~/components/shell/prompt_shell";

import type {Route} from "./+types/authentication.log-in.expired";

export async function loader(loaderArgs: Route.LoaderArgs) {
    const {request} = loaderArgs;

    await requireGuestSession(request);
}

export default function AuthenticationLogInExpired() {
    return (
        <PromptShell title="Login Revoked." query="Revoked" color="red.solid">
            <Text>
                The login you were trying to handle was{" "}
                <Strong color="red.solid">revoked</Strong>.
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
