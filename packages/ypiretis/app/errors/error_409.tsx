import {Text} from "@chakra-ui/react";

import PromptShell from "~/components/shell/prompt_shell";

export default function Error400() {
    return (
        <>
            <PromptShell.Title title="Resource Conflict." query="Conflict" />
            <PromptShell.Body>
                <Text>
                    This page was accessed with input that mismatches the
                    underlying resource's state.
                </Text>
            </PromptShell.Body>
        </>
    );
}
