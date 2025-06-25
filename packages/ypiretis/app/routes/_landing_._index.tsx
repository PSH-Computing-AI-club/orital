import {Bleed, Box, Container} from "@chakra-ui/react";

import Background3DGrid from "~/components/frontpage/background_3d_grid";

import type {Route} from "./+types/_landing_._index";

export default function LandingIndex(_props: Route.ComponentProps) {
    return (
        <>
            <Bleed blockStart="16" asChild>
                <Box
                    display="flex"
                    bg="bg.inverted"
                    color="fg.inverted"
                    paddingBlockStart="calc(var(--chakra-sizes-16) + var(--chakra-spacing-4))"
                    minBlockSize="dvh"
                >
                    <Background3DGrid.Root>
                        <Container flexGrow="1">
                            <Background3DGrid.Scene />
                        </Container>
                    </Background3DGrid.Root>
                </Box>
            </Bleed>

            <Box marginBlockEnd="4">
                <Container>
                    <h1>Hello world!</h1>
                    <h1>Hello world!</h1>
                    <h1>Hello world!</h1>
                    <h1>Hello world!</h1>
                    <h1>Hello world!</h1>
                    <h1>Hello world!</h1>
                    <h1>Hello world!</h1>
                    <h1>Hello world!</h1>
                    <h1>Hello world!</h1>
                    <h1>Hello world!</h1>
                    <h1>Hello world!</h1>
                    <h1>Hello world!</h1>
                    <h1>Hello world!</h1>
                    <h1>Hello world!</h1>
                    <h1>Hello world!</h1>
                    <h1>Hello world!</h1>
                    <h1>Hello world!</h1>
                    <h1>Hello world!</h1>
                    <h1>Hello world!</h1>
                    <h1>Hello world!</h1>
                    <h1>Hello world!</h1>
                    <h1>Hello world!</h1>
                    <h1>Hello world!</h1>
                    <h1>Hello world!</h1>
                    <h1>Hello world!</h1>
                    <h1>Hello world!</h1>
                    <h1>Hello world!</h1>
                    <h1>Hello world!</h1>
                    <h1>Hello world!</h1>
                    <h1>Hello world!</h1>
                    <h1>Hello world!</h1>
                    <h1>Hello world!</h1>
                    <h1>Hello world!</h1>
                    <h1>Hello world!</h1>
                    <h1>Hello world!</h1>
                    <h1>Hello world!</h1>
                    <h1>Hello world!</h1>
                    <h1>Hello world!</h1>
                    <h1>Hello world!</h1>
                    <h1>Hello world!</h1>
                    <h1>Hello world!</h1>
                    <h1>Hello world!</h1>
                    <h1>Hello world!</h1>
                    <h1>Hello world!</h1>
                    <h1>Hello world!</h1>
                    <h1>Hello world!</h1>
                    <h1>Hello world!</h1>
                    <h1>Hello world!</h1>
                    <h1>Hello world!</h1>
                    <h1>Hello world!</h1>
                    <h1>Hello world!</h1>
                    <h1>Hello world!</h1>
                    <h1>Hello world!</h1>
                    <h1>Hello world!</h1>
                    <h1>Hello world!</h1>
                    <h1>Hello world!</h1>
                    <h1>Hello world!</h1>
                </Container>
            </Box>
        </>
    );
}
