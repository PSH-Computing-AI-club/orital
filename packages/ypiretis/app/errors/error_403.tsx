import {Text} from "@chakra-ui/react";

import PromptShell from "~/components/shell/prompt_shell";

export const TITLE = "Access Forbidden.";

const QUERY = "Forbidden";

export default function Error403() {
    return (
        <PromptShell title={TITLE} query={QUERY}>
            <Text>Access to this page was forbidden.</Text>
        </PromptShell>
    );
}
