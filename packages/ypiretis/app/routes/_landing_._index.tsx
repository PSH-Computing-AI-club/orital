import {
    Bleed,
    Box,
    Card,
    Container,
    Flex,
    SimpleGrid,
    Span,
    Text,
} from "@chakra-ui/react";

import Background3DGrid from "~/components/frontpage/background_3d_grid";
import FeatureSection from "~/components/frontpage/feature_section";

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

            <FeatureSection.Root>
                <FeatureSection.Container>
                    <FeatureSection.Image src="/images/landing.psh.webp" />

                    <FeatureSection.Body>
                        <FeatureSection.Title>
                            We Are{" "}
                            <Span whiteSpace="pre">
                                <Span whiteSpace="pre">Penn State</Span>{" "}
                                Harrisburg!
                            </Span>
                        </FeatureSection.Title>

                        <FeatureSection.Description>
                            The Computing and AI Club provides a friendly
                            atmosphere for all PSH students to network, hone
                            their skills, and to have fun all things computing.
                        </FeatureSection.Description>
                    </FeatureSection.Body>
                </FeatureSection.Container>
            </FeatureSection.Root>

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

            <FeatureSection.Root>
                <FeatureSection.Container>
                    <FeatureSection.Body>
                        <FeatureSection.Title>
                            Bi-Weekly Meetings
                        </FeatureSection.Title>

                        <FeatureSection.Description>
                            To promote club camaraderie, the Computing and AI
                            Club hosts bi-weekly meetings every XYZday @ common
                            hour.
                        </FeatureSection.Description>
                    </FeatureSection.Body>

                    <FeatureSection.Image src="/images/landing.calendar.webp" />
                </FeatureSection.Container>
            </FeatureSection.Root>

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
        </>
    );
}
