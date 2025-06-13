import {Text} from "@chakra-ui/react";

import PromptShell from "~/components/shell/prompt_shell";

export default function Error404() {
    return (
        <>
            <PromptShell.Title title="Not Found." query="Found" />
            <PromptShell.Body>
                <Text>This page does not exist.</Text>
            </PromptShell.Body>
        </>
    );
}
