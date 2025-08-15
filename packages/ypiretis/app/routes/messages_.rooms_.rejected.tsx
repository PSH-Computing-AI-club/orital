import {Strong, Text} from "@chakra-ui/react";

import PromptShell from "~/components/shell/prompt_shell";

export default function MessagesRoomsBanned() {
    return (
        <>
            <PromptShell.Title
                title="Rejected from Room."
                query="Rejected"
                color="red.solid"
            />

            <PromptShell.Body>
                <Text>
                    The room's presenter{" "}
                    <Strong color="red.solid">rejected</Strong> your attempt to
                    connect to the room.
                </Text>
            </PromptShell.Body>
        </>
    );
}
