import {
    Bleed,
    Box,
    Card,
    Container,
    Flex,
    Heading,
    HStack,
    Image,
    Link,
    SimpleGrid,
    Span,
    Stack,
    Text,
    VStack,
} from "@chakra-ui/react";

import {Link as RouterLink} from "react-router";

import Background3DGrid from "~/components/frontpage/background_3d_grid";

import type {Route} from "./+types/_landing_._index";

export default function LandingIndex(_props: Route.ComponentProps) {
    return (
        <>
            <Bleed blockStart="20" asChild>
                <Box
                    display="flex"
                    bg="bg.inverted"
                    color="fg.inverted"
                    paddingBlockStart="calc(var(--chakra-sizes-16) + var(--chakra-spacing-8))"
                    minBlockSize="dvh"
                >
                    <Background3DGrid.Root>
                        <Container flexGrow="1">
                            <Background3DGrid.Scene />
                        </Container>
                    </Background3DGrid.Root>
                </Box>
            </Bleed>

            <Flex
                alignItems="center"
                bg="bg.inverted"
                color="fg.inverted"
                paddingBlock="8"
                paddingInline={{base: "4", lgDown: "0"}}
                minBlockSize="xl"
            >
                <Container>
                    <Card.Root
                        variant="subtle"
                        gap={{base: "8", lgDown: "0"}}
                        flexDirection={{base: "row", lgDown: "column"}}
                        alignItems="center"
                        justifyContent="space-between"
                        bg="transparent"
                        overflow="hidden"
                    >
                        <Image
                            objectFit="contain"
                            inlineSize="full"
                            maxInlineSize="lg"
                            src="/images/landing.psh.webp"
                        />

                        <Card.Body gap="8">
                            <Card.Title
                                color="fg.inverted"
                                fontSize={{base: "4xl", lgDown: "3xl"}}
                                lineHeight="normal"
                                textAlign={{base: "inherit", lgDown: "center"}}
                            >
                                We Are{" "}
                                <Span whiteSpace="pre">
                                    <Span whiteSpace="pre">Penn State</Span>{" "}
                                    Harrisburg!
                                </Span>
                            </Card.Title>

                            <Card.Description
                                color="fg.subtle"
                                fontSize={{base: "2xl", lgDown: "xl"}}
                            >
                                The Computing and AI Club provides a friendly
                                atmosphere for all PSH students to network, hone
                                their skills, and to have fun all things
                                computing.
                            </Card.Description>
                        </Card.Body>
                    </Card.Root>
                </Container>
            </Flex>

            <Flex
                alignItems="center"
                bg="bg.muted"
                color="fg.inverted"
                paddingBlock="8"
                paddingInline={{base: "4", lgDown: "0"}}
                minBlockSize="xl"
            >
                <Container>
                    <Card.Root
                        variant="subtle"
                        gap="8"
                        bg="transparent"
                        overflow="hidden"
                    >
                        <Card.Body gap="4">
                            <Card.Title
                                fontSize={{base: "4xl", lgDown: "3xl"}}
                                textAlign="center"
                            >
                                Events?
                            </Card.Title>

                            <Card.Description
                                fontSize={{base: "2xl", lgDown: "xl"}}
                                textAlign="center"
                            >
                                We got some of those.
                            </Card.Description>

                            <SimpleGrid
                                columns={{base: 3, lgDown: 2, mdDown: 1}}
                                gap="8"
                                marginBlockStart="4"
                            >
                                <Card.Root>
                                    <Card.Body>
                                        <Card.Title>
                                            AI Injection Competition
                                        </Card.Title>

                                        <Card.Description>
                                            November 20th, 2025
                                        </Card.Description>

                                        <Text marginBlockStart="4">
                                            Lorem ipsum dolor sit amet,
                                            consectetur adipiscing elit, sed do
                                            eiusmod tempor incididunt ut labore
                                            et dolore magnam aliquam quaerat
                                            voluptatem.
                                        </Text>
                                    </Card.Body>
                                </Card.Root>

                                <Card.Root>
                                    <Card.Body>
                                        <Card.Title>Event 2</Card.Title>

                                        <Card.Description>
                                            November ??th, 2025
                                        </Card.Description>

                                        <Text marginBlockStart="4">
                                            Lorem ipsum dolor sit amet,
                                            consectetur adipiscing elit, sed do
                                            eiusmod tempor incididunt ut labore
                                            et dolore magnam aliquam quaerat
                                            voluptatem.
                                        </Text>
                                    </Card.Body>
                                </Card.Root>

                                <Card.Root>
                                    <Card.Body>
                                        <Card.Title>Event 3</Card.Title>

                                        <Card.Description>
                                            November ??th, 2025
                                        </Card.Description>

                                        <Text marginBlockStart="4">
                                            Lorem ipsum dolor sit amet,
                                            consectetur adipiscing elit, sed do
                                            eiusmod tempor incididunt ut labore
                                            et dolore magnam aliquam quaerat
                                            voluptatem.
                                        </Text>
                                    </Card.Body>
                                </Card.Root>
                            </SimpleGrid>
                        </Card.Body>
                    </Card.Root>
                </Container>
            </Flex>

            <Flex
                alignItems="center"
                bg="bg.inverted"
                color="fg.inverted"
                paddingBlock="8"
                paddingInline={{base: "4", lgDown: "0"}}
                minBlockSize="xl"
            >
                <Container>
                    <Card.Root
                        variant="subtle"
                        gap={{base: "8", lgDown: "0"}}
                        flexDirection={{base: "row", lgDown: "column-reverse"}}
                        alignItems="center"
                        justifyContent="space-between"
                        bg="transparent"
                        overflow="hidden"
                    >
                        <Card.Body gap="8">
                            <Card.Title
                                color="fg.inverted"
                                fontSize={{base: "4xl", lgDown: "3xl"}}
                                lineHeight="normal"
                                textAlign={{base: "inherit", lgDown: "center"}}
                            >
                                Bi-Weekly Meetings
                            </Card.Title>

                            <Card.Description
                                color="fg.subtle"
                                fontSize={{base: "2xl", lgDown: "xl"}}
                            >
                                To promote club camaraderie, the Computing and
                                AI Club hosts bi-weekly meetings every XYZday @
                                common hour.
                            </Card.Description>
                        </Card.Body>

                        <Image
                            objectFit="contain"
                            inlineSize="full"
                            maxInlineSize="lg"
                            src="/images/landing.calendar.webp"
                        />
                    </Card.Root>
                </Container>
            </Flex>

            <Flex
                alignItems="center"
                bg="bg.muted"
                color="fg.inverted"
                paddingBlock="8"
                paddingInline={{base: "4", lgDown: "0"}}
                minBlockSize="xl"
            >
                <Container>
                    <Card.Root
                        variant="subtle"
                        gap="8"
                        bg="transparent"
                        overflow="hidden"
                    >
                        <Card.Body gap="4">
                            <Card.Title
                                fontSize={{base: "4xl", lgDown: "3xl"}}
                                textAlign="center"
                            >
                                News?
                            </Card.Title>

                            <Card.Description
                                fontSize={{base: "2xl", lgDown: "xl"}}
                                textAlign="center"
                            >
                                Sure, we have our ramblings available.
                            </Card.Description>

                            <SimpleGrid
                                columns={{base: 3, lgDown: 2, mdDown: 1}}
                                gap="8"
                                marginBlockStart="4"
                            >
                                <Card.Root>
                                    <Card.Body>
                                        <Card.Title>
                                            Dots and Boxes AI Competition Winner
                                            Announced!
                                        </Card.Title>

                                        <Card.Description>
                                            September 10th, 2025
                                        </Card.Description>

                                        <Text marginBlockStart="4">
                                            Lorem ipsum dolor sit amet,
                                            consectetur adipiscing elit, sed do
                                            eiusmod tempor incididunt ut labore
                                            et dolore magnam aliquam quaerat
                                            voluptatem.
                                        </Text>
                                    </Card.Body>
                                </Card.Root>

                                <Card.Root>
                                    <Card.Body>
                                        <Card.Title>News 2</Card.Title>

                                        <Card.Description>
                                            September ??th, 2025
                                        </Card.Description>

                                        <Text marginBlockStart="4">
                                            Lorem ipsum dolor sit amet,
                                            consectetur adipiscing elit, sed do
                                            eiusmod tempor incididunt ut labore
                                            et dolore magnam aliquam quaerat
                                            voluptatem.
                                        </Text>
                                    </Card.Body>
                                </Card.Root>

                                <Card.Root>
                                    <Card.Body>
                                        <Card.Title>News 3</Card.Title>

                                        <Card.Description>
                                            September ??th, 2025
                                        </Card.Description>

                                        <Text marginBlockStart="4">
                                            Lorem ipsum dolor sit amet,
                                            consectetur adipiscing elit, sed do
                                            eiusmod tempor incididunt ut labore
                                            et dolore magnam aliquam quaerat
                                            voluptatem.
                                        </Text>
                                    </Card.Body>
                                </Card.Root>
                            </SimpleGrid>
                        </Card.Body>
                    </Card.Root>
                </Container>
            </Flex>

            <Flex
                bg="bg.inverted"
                color="fg.inverted"
                backgroundImage="url('/images/footer.border.webp')"
                backgroundSize="512px"
                backgroundRepeat="repeat-x"
                paddingBlock="8"
                paddingInline={{base: "4", lgDown: "0"}}
                blockSize={{base: "sm", smDown: "2xl"}}
            >
                <Container marginBlockStart="auto">
                    <Stack
                        gap="8"
                        flexDirection={{base: "row", smDown: "column"}}
                    >
                        <Image
                            objectFit="contain"
                            blockSize={{base: "3xs", mdDown: "48"}}
                            src="/images/logo.monochrome.light.webp"
                        />

                        <Box flexGrow="1" />

                        <HStack gap="8" justifyContent="center">
                            <VStack gap="2" alignItems="baseline">
                                <Heading>Club</Heading>

                                <Link
                                    color="currentcolor"
                                    _hover={{color: "cyan.solid"}}
                                    href="https://github.com/PSH-Computing-AI-Club"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    GitHub
                                </Link>

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
                                    _hover={{color: "cyan.solid"}}
                                    asChild
                                >
                                    <RouterLink to="/discord" target="_blank">
                                        Discord
                                    </RouterLink>
                                </Link>
                            </VStack>

                            <VStack gap="2" alignItems="baseline">
                                <Heading>Site</Heading>

                                <Link
                                    color="currentcolor"
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

                                <Link
                                    color="currentcolor"
                                    _hover={{color: "cyan.solid"}}
                                    asChild
                                >
                                    <RouterLink
                                        to="/rooms/join"
                                        target="_blank"
                                    >
                                        Join Room
                                    </RouterLink>
                                </Link>
                            </VStack>
                        </HStack>
                    </Stack>
                </Container>
            </Flex>
        </>
    );
}
