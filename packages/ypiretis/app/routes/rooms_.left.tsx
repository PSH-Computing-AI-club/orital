import {Strong, Text} from "@chakra-ui/react";

import PromptShell from "~/components/shell/prompt_shell";

export default function RoomsClosed() {
    return (
        <PromptShell.Root>
            <PromptShell.Sidebar />

            <PromptShell.Container>
                <PromptShell.Title title="Left Room." query="Left" />

                <PromptShell.Body>
                    <Text>
                        You <Strong color="cyan.solid">left</Strong> the room
                        you were connected to.
                    </Text>
                </PromptShell.Body>
            </PromptShell.Container>
        </PromptShell.Root>
    );
}
