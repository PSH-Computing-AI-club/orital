import {Strong, Text} from "@chakra-ui/react";

import PromptShell from "~/components/shell/prompt_shell";

export default function Kicked() {
    return (
        <PromptShell.Root>
            <PromptShell.Sidebar />

            <PromptShell.Container>
                <PromptShell.Title
                    title="Kicked from Room."
                    query="Kicked"
                    color="red.solid"
                />

                <PromptShell.Body>
                    <Text>
                        You were <Strong color="red.solid">kicked</Strong> from
                        the room you were connected to.
                    </Text>
                </PromptShell.Body>
            </PromptShell.Container>
        </PromptShell.Root>
    );
}
