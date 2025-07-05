import {Strong, Text} from "@chakra-ui/react";

import {data} from "react-router";

import PromptShell from "~/components/shell/prompt_shell";

import type {Route} from "./+types/rooms_.disposed";

export function loader(_loaderArgs: Route.LoaderArgs) {
    return data("Conflict", {
        status: 409,
    });
}

export default function RoomsDisposed() {
    return (
        <PromptShell.Root>
            <PromptShell.Sidebar />

            <PromptShell.Container>
                <PromptShell.Title title="Room Disposed." query="Disposed" />

                <PromptShell.Body>
                    <Text>
                        The room you were trying to connect to was previously{" "}
                        <Strong color="cyan.solid">closed</Strong>.
                    </Text>
                </PromptShell.Body>
            </PromptShell.Container>
        </PromptShell.Root>
    );
}
