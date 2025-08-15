import {Strong, Text} from "@chakra-ui/react";

import PromptShell from "~/components/shell/prompt_shell";

import {APP_NAME} from "~/utils/constants";

export default function MessagesAuthenticationConsentRevoked() {
    return (
        <>
            <PromptShell.Title
                title="Login Revoked."
                query="Revoked"
                color="red.solid"
            />

            <PromptShell.Body>
                <Text>
                    You have <Strong color="red.solid">revoked</Strong> the
                    login into {APP_NAME}.
                </Text>

                <Text>
                    You may safely close this page and return to your original
                    browser window if you wish to log-in again.
                </Text>
            </PromptShell.Body>
        </>
    );
}
