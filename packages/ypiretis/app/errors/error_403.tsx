import {Text} from "@chakra-ui/react";

import PromptShell from "~/components/shell/prompt_shell";

export default function Error403() {
    return (
        <PromptShell title="Access Forbidden." query="Forbidden">
            <Text>Access to this page was forbidden.</Text>
        </PromptShell>
    );
}
