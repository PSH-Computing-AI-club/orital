import {Link, Strong, Text} from "@chakra-ui/react";

import {Link as RouterLink} from "react-router";

import PromptShell from "~/components/shell/prompt_shell";

export default function AuthenticationLogInExpired() {
    return (
        <>
            <PromptShell.Title
                title="Login Expired."
                query="Expired"
                color="red.solid"
            />

            <PromptShell.Body>
                <Text>
                    The login you were trying to handle has{" "}
                    <Strong color="red.solid">expired</Strong>.
                </Text>

                <Text>
                    Return to the{" "}
                    <Link variant="underline" color="blue.solid" asChild>
                        <RouterLink to="/authentication/log-in">
                            log-in
                        </RouterLink>
                    </Link>{" "}
                    page to log-in again.
                </Text>
            </PromptShell.Body>
        </>
    );
}
