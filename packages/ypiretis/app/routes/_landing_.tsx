import {Container, HStack, Link} from "@chakra-ui/react";

import {Link as RouterLink, Outlet} from "react-router";

export default function LandingLayout() {
    return (
        <>
            <Container
                bg="bg"
                borderBlockEndColor="border"
                borderBlockEndStyle="solid"
                borderBlockEndWidth="thin"
                blockSize="16"
                padding="4"
            >
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
                    C&AI
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

            <Outlet />
        </>
    );
}
