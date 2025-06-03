import {Text} from "@chakra-ui/react";

import PromptShell from "~/components/shell/prompt_shell";

export default function Error404() {
    return (
        <PromptShell title="Not Found." query="Found">
            <Text>This page does not exist.</Text>
        </PromptShell>
    );
}
