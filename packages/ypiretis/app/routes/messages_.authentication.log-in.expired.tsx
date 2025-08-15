import {Strong, Text} from "@chakra-ui/react";

import Links from "~/components/common/links";

import PromptShell from "~/components/shell/prompt_shell";

export default function MessagesAuthenticationLogInExpired() {
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
                    <Links.InternalLink
                        variant="prose"
                        to="/authentication/log-in"
                    >
                        log-in
                    </Links.InternalLink>{" "}
                    page to log-in again.
                </Text>
            </PromptShell.Body>
        </>
    );
}
