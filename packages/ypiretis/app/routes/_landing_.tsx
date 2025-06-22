import {Box, Container, HStack, Link} from "@chakra-ui/react";

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
                insetBlockStart="calc((var(--chakra-spacing-16) * -1) / 4)"
                insetInlineStart="0"
                blockSize="1px"
                inlineSize="1px"
            />

            <Box
                pos="sticky"
                insetBlockStart="4"
                marginBlockStart="4"
                blockSize="16"
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
                        visibility={isObscured ? undefined : "hidden"}
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

            <Box marginBlockEnd="4" zIndex="1">
                <Container>
                    <Outlet />
                </Container>
            </Box>
        </>
    );
}
