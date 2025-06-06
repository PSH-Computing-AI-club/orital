import {Text} from "@chakra-ui/react";

import PromptShell from "~/components/shell/prompt_shell";

export default function Error400() {
    return (
        <PromptShell title="Bad Request." query="Request">
            <Text>This page was accessed with malformed input.</Text>
        </PromptShell>
    );
}
