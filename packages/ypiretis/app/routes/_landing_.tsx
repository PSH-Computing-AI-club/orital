import {Box, Container, HStack, Link} from "@chakra-ui/react";

import {Link as RouterLink, Outlet} from "react-router";

export default function LandingLayout() {
    return (
        <>
            <Box
                pos="sticky"
                insetBlockStart="0"
                blockSize="20"
                paddingBlockStart="4"
                paddingInline="8"
                zIndex="2"
            >
                <Container blockSize="full">
                    <Box
                        position="absolute"
                        inset="0"
                        bg="bg"
                        borderColor="border"
                        borderStyle="solid"
                        borderWidth="thin"
                        zIndex="-1"
                    />

                    <HStack gap="4" alignItems="center" blockSize="full">
                        <Link
                            marginInlineStart="auto"
                            _hover={{color: "cyan.solid"}}
                            asChild
                        >
                            <RouterLink to="/news">News</RouterLink>
                        </Link>
                        <Link _hover={{color: "cyan.solid"}} asChild>
                            <RouterLink to="/events">Events</RouterLink>
                        </Link>
                        <strong>C&AI</strong>
                        <Link _hover={{color: "cyan.solid"}} asChild>
                            <RouterLink to="/engage">Engage</RouterLink>
                        </Link>
                        <Link
                            marginInlineEnd="auto"
                            _hover={{color: "cyan.solid"}}
                            asChild
                        >
                            <RouterLink to="/discord">Discord</RouterLink>
                        </Link>
                    </HStack>
                </Container>
            </Box>

            <Box paddingBlockEnd="4" zIndex="1">
                <Container>
                    <Outlet />
                </Container>
            </Box>
        </>
    );
}
