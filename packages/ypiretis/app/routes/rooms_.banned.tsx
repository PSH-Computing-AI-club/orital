import {Strong, Text} from "@chakra-ui/react";

import PromptShell from "~/components/shell/prompt_shell";

export default function RoomsBanned() {
    return (
        <PromptShell.Root>
            <PromptShell.Sidebar />

            <PromptShell.Container>
                <PromptShell.Title
                    title="Banned from Room."
                    query="Banned"
                    color="red.solid"
                />

                <PromptShell.Body>
                    <Text>
                        You were <Strong color="red.solid">banned</Strong> from
                        the room you were connected to.
                    </Text>
                </PromptShell.Body>
            </PromptShell.Container>
        </PromptShell.Root>
    );
}
