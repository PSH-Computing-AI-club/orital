import {Text} from "@chakra-ui/react";

import PromptShell from "~/components/shell/prompt_shell";

export default function Error423() {
    return (
        <>
            <PromptShell.Title title="Resource Locked." query="Locked" />
            <PromptShell.Body>
                <Text>This page was accessed is in a locked state.</Text>
            </PromptShell.Body>
        </>
    );
}
