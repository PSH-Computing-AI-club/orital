import {Text} from "@chakra-ui/react";

import PromptShell from "~/components/shell/prompt_shell";

export const TITLE = "Not Found.";

const QUERY = "Found";

export default function Error404() {
    return (
        <PromptShell title={TITLE} query={QUERY}>
            <Text>This page does not exist.</Text>
        </PromptShell>
    );
}
