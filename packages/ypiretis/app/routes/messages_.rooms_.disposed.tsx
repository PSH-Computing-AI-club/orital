import {Strong, Text} from "@chakra-ui/react";

import {data} from "react-router";

import PromptShell from "~/components/shell/prompt_shell";

export function loader() {
    return data("Conflict", {
        status: 409,
    });
}

export default function MessagesRoomsDisposed() {
    return (
        <>
            <PromptShell.Title title="Room Disposed." query="Disposed" />

            <PromptShell.Body>
                <Text>
                    The room you were trying to connect to was previously{" "}
                    <Strong color="cyan.solid">closed</Strong>.
                </Text>
            </PromptShell.Body>
        </>
    );
}
