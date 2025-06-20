import {Strong, Text} from "@chakra-ui/react";

import PromptShell from "~/components/shell/prompt_shell";

export default function RoomsClosed() {
    return (
        <PromptShell.Root>
            <PromptShell.Sidebar />

            <PromptShell.Container>
                <PromptShell.Title title="Room Closed." query="Closed" />

                <PromptShell.Body>
                    <Text>
                        The room you were connected to was{" "}
                        <Strong color="cyan.solid">closed</Strong>.
                    </Text>
                </PromptShell.Body>
            </PromptShell.Container>
        </PromptShell.Root>
    );
}
