import {Box, Container, Image, HStack, Link} from "@chakra-ui/react";

import type {RefObject} from "react";
import {useEffect, useRef, useState} from "react";

import {Link as RouterLink, Outlet} from "react-router";

function useNavbarSentinel(sentinelRef: RefObject<HTMLElement | null>) {
    const [isObscured, setIsObscured] = useState<boolean>(false);

    useEffect(() => {
        if (!sentinelRef.current) {
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                const [firstEntry] = entries;
                const {isIntersecting} = firstEntry;

                setIsObscured(!isIntersecting);
            },
            {
                root: null,
                rootMargin: "0px",
                threshold: 1,
            },
        );

        observer.observe(sentinelRef.current);

        return () => {
            observer.disconnect();
        };
    }, [sentinelRef]);

    return isObscured;
}

export default function LandingLayout() {
    const sentinelRef = useRef<HTMLElement | null>(null);
    const isObscured = useNavbarSentinel(sentinelRef);

    return (
        <>
            <Box
                ref={sentinelRef}
                position="absolute"
                insetBlockStart="0"
                insetInlineStart="0"
                blockSize="1px"
                inlineSize="1px"
            />

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
                            <RouterLink to="/engage">Engage</RouterLink>
                        </Link>

                        <Link
                            color="currentcolor"
                            marginInlineEnd="auto"
                            _hover={{color: "cyan.solid"}}
                            asChild
                        >
                            <RouterLink to="/discord">Discord</RouterLink>
                        </Link>
                    </HStack>
                </Container>
            </Box>

            <Outlet />
        </>
    );
}
