import {Strong, Text} from "@chakra-ui/react";

import {data} from "react-router";

import PromptShell from "~/components/shell/prompt_shell";

export function loader() {
    return data("Not Found", {
        status: 404,
    });
}

export default function MessagesRoomsNotFound() {
    return (
        <>
            <PromptShell.Title title="Room Not Found." query="Not Found" />

            <PromptShell.Body>
                <Text>
                    The room you were trying to connect to was{" "}
                    <Strong color="cyan.solid">not found</Strong>.
                </Text>
            </PromptShell.Body>
        </>
    );
}
