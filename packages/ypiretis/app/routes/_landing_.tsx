import {Box, Container, Image, HStack, Link} from "@chakra-ui/react";

import {Link as RouterLink, Outlet} from "react-router";

import useObscuredSentinel from "~/hooks/obscured_sentinel";

export default function LandingLayout() {
    const {isObscured, ObscuredSentinel} = useObscuredSentinel();

    return (
        <>
            {ObscuredSentinel}

            <Box
                pos="sticky"
                insetBlockStart="8"
                blockSize="20"
                paddingInline="8"
                zIndex="2"
            >
                <Container
                    bg={isObscured ? "transparent" : "bg.inverted"}
                    color="fg.inverted"
                    blockSize="full"
                >
                    <Box
                        position="absolute"
                        inset="0"
                        bg="bg.inverted"
                        borderColor="border.inverted"
                        borderStyle="solid"
                        borderWidth="thin"
                        zIndex="-1"
                        visibility={isObscured ? undefined : "hidden"}
                    />

                    <HStack gap="4" alignItems="center" blockSize="full">
                        <Link
                            color="currentcolor"
                            marginInlineStart="auto"
                            _hover={{color: "cyan.solid"}}
                            asChild
                        >
                            <RouterLink to="/news">News</RouterLink>
                        </Link>

                        <Link
                            color="currentcolor"
                            _hover={{color: "cyan.solid"}}
                            asChild
                        >
                            <RouterLink to="/events">Events</RouterLink>
                        </Link>

                        <Image
                            objectFit="contain"
                            blockSize="16"
                            src="/images/logo.monochrome.light.webp"
                        />

                        <Link
                            color="currentcolor"
                            _hover={{color: "cyan.solid"}}
                            asChild
                        >
                            <RouterLink to="/engage" target="_blank">
                                Engage
                            </RouterLink>
                        </Link>

                        <Link
                            color="currentcolor"
                            marginInlineEnd="auto"
                            _hover={{color: "cyan.solid"}}
                            asChild
                        >
                            <RouterLink to="/discord" target="_blank">
                                Discord
                            </RouterLink>
                        </Link>
                    </HStack>
                </Container>
            </Box>

            <Outlet />
        </>
    );
}
