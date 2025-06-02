import {Text} from "@chakra-ui/react";

import PromptShell from "~/components/shell/prompt_shell";

export const TITLE = "Not Authorized.";

const QUERY = "Authorized";

export default function Error401() {
    return (
        <PromptShell title={TITLE} query={QUERY}>
            <Text>You are not authorized to view this page.</Text>
        </PromptShell>
    );
}
