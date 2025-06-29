import {Bleed, Box, Card, Container, Span, Text} from "@chakra-ui/react";

import Background3DGrid from "~/components/frontpage/background_3d_grid";
import FeatureSection from "~/components/frontpage/feature_section";
import FeedSection from "~/components/frontpage/feed_section";

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

            <FeedSection.Root>
                <FeedSection.Container>
                    <FeedSection.Body>
                        <FeedSection.Title>Events?</FeedSection.Title>

                        <FeedSection.Description>
                            We got some of those.
                        </FeedSection.Description>

                        <FeedSection.Grid>
                            <Card.Root>
                                <Card.Body>
                                    <Card.Title>
                                        AI Injection Competition
                                    </Card.Title>

                                    <Card.Description>
                                        November 20th, 2025
                                    </Card.Description>

                                    <Text marginBlockStart="4">
                                        Lorem ipsum dolor sit amet, consectetur
                                        adipiscing elit, sed do eiusmod tempor
                                        incididunt ut labore et dolore magnam
                                        aliquam quaerat voluptatem.
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
                                        Lorem ipsum dolor sit amet, consectetur
                                        adipiscing elit, sed do eiusmod tempor
                                        incididunt ut labore et dolore magnam
                                        aliquam quaerat voluptatem.
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
                                        Lorem ipsum dolor sit amet, consectetur
                                        adipiscing elit, sed do eiusmod tempor
                                        incididunt ut labore et dolore magnam
                                        aliquam quaerat voluptatem.
                                    </Text>
                                </Card.Body>
                            </Card.Root>
                        </FeedSection.Grid>
                    </FeedSection.Body>
                </FeedSection.Container>
            </FeedSection.Root>

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

            <FeedSection.Root>
                <FeedSection.Container>
                    <FeedSection.Body>
                        <FeedSection.Title>News?</FeedSection.Title>

                        <FeedSection.Description>
                            Sure, we have our ramblings available.
                        </FeedSection.Description>

                        <FeedSection.Grid>
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
                                        Lorem ipsum dolor sit amet, consectetur
                                        adipiscing elit, sed do eiusmod tempor
                                        incididunt ut labore et dolore magnam
                                        aliquam quaerat voluptatem.
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
                                        Lorem ipsum dolor sit amet, consectetur
                                        adipiscing elit, sed do eiusmod tempor
                                        incididunt ut labore et dolore magnam
                                        aliquam quaerat voluptatem.
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
                                        Lorem ipsum dolor sit amet, consectetur
                                        adipiscing elit, sed do eiusmod tempor
                                        incididunt ut labore et dolore magnam
                                        aliquam quaerat voluptatem.
                                    </Text>
                                </Card.Body>
                            </Card.Root>
                        </FeedSection.Grid>
                    </FeedSection.Body>
                </FeedSection.Container>
            </FeedSection.Root>
        </>
    );
}
