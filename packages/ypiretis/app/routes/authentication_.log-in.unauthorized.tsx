import {Strong, Text} from "@chakra-ui/react";

import Links from "~/components/common/links";

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
                    <Strong color="red.solid">already expired</Strong>,{" "}
                    <Strong color="red.solid">does not exist</Strong>, or is{" "}
                    <Strong color="red.solid">pending in another tab</Strong>.
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
