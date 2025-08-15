import {Strong, Text} from "@chakra-ui/react";

import PromptShell from "~/components/shell/prompt_shell";

import {APP_NAME} from "~/utils/constants";

export default function MessagesAuthenticationConsentAuthorized() {
    return (
        <>
            <PromptShell.Title
                title="Login Authorized."
                query="Authorized"
                color="green.solid"
            />

            <PromptShell.Body>
                <Text>
                    You have <Strong color="green.solid">authorized</Strong> the
                    login into {APP_NAME}.
                </Text>

                <Text>
                    You may safely close this page and return to your original
                    browser window.
                </Text>
            </PromptShell.Body>
        </>
    );
}
