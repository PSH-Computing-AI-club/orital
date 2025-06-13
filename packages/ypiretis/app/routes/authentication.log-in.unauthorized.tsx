import {Link, Strong, Text} from "@chakra-ui/react";

import {Link as RouterLink} from "react-router";

import PromptShell from "~/components/shell/prompt_shell";

export default function AuthenticationLogInUnauthorized() {
    return (
        <>
            <PromptShell.Title
                title="Login Unauthorized."
                query="Unauthorized"
                color="red.solid"
            />

            <PromptShell.Body>
                <Text>
                    The login you are trying to handle has{" "}
                    <Strong color="red.solid">already expired</Strong> or{" "}
                    <Strong color="red.solid">does not exist</Strong>.
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
