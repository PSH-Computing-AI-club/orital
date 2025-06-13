import {Text} from "@chakra-ui/react";

import PromptShell from "~/components/shell/prompt_shell";

export default function Error401() {
    return (
        <>
            <PromptShell.Title title="Not Authorized." query="Authorized" />
            <PromptShell.Body>
                <Text>You are not authorized to view this page.</Text>
            </PromptShell.Body>
        </>
    );
}
