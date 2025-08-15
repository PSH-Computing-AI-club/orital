import {Strong, Text} from "@chakra-ui/react";

import PromptShell from "~/components/shell/prompt_shell";

export default function MessagesAuthenticationConsentExpired() {
    return (
        <>
            <PromptShell.Title
                title="Login Expired."
                query="Expired"
                color="red.solid"
            />

            <PromptShell.Body>
                <Text>
                    The login you are trying to handle has{" "}
                    <Strong color="red.solid">expired</Strong>.
                </Text>

                <Text>
                    You may safely close this page and return to your original
                    browser window if you wish to log-in again.
                </Text>
            </PromptShell.Body>
        </>
    );
}
