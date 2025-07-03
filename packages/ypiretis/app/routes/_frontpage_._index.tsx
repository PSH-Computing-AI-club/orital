import {Container, Span} from "@chakra-ui/react";

import {Suspense, lazy} from "react";

import {ClientOnly} from "remix-utils/client-only";

import Background3DGrid from "~/components/frontpage/background_3d_grid";
import FeedCard from "~/components/frontpage/feed_card";
import FeedSection from "~/components/frontpage/feed_section";
import FeatureSection from "~/components/frontpage/feature_section";
import FullscreenHero from "~/components/frontpage/fullscreen_hero";
import PeopleCard from "~/components/frontpage/people_card";
import PeopleSection from "~/components/frontpage/people_section";

import type {Route} from "./+types/_frontpage_._index";

const AnimatedLogo = lazy(() => import("~/components/frontpage/animated_logo"));

export default function FrontpageIndex(_props: Route.ComponentProps) {
    return (
        <>
            <FullscreenHero.Root>
                <Background3DGrid.Root>
                    <Container flexGrow="1">
                        <ClientOnly>
                            {() => (
                                <Suspense>
                                    <Background3DGrid.Scene />
                                    <AnimatedLogo />
                                </Suspense>
                            )}
                        </ClientOnly>
                    </Container>
                </Background3DGrid.Root>
            </FullscreenHero.Root>

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

            <PeopleSection.Root>
                <PeopleSection.Container>
                    <PeopleSection.Body>
                        <PeopleSection.Title>Club Officers</PeopleSection.Title>

                        <PeopleSection.Description>
                            We are also ourselves!
                        </PeopleSection.Description>

                        <PeopleSection.Grid>
                            <PeopleCard.Root>
                                <PeopleCard.Body>
                                    <PeopleCard.Avatar
                                        name="Alexander O. Petrov"
                                        src="/images/landing.avatars.aop5448.webp"
                                    />

                                    <PeopleCard.Title>
                                        Alexander O. Petrov
                                    </PeopleCard.Title>

                                    <PeopleCard.Email email="aop5448@psu.edu" />

                                    <PeopleCard.Text>President</PeopleCard.Text>
                                </PeopleCard.Body>
                            </PeopleCard.Root>

                            <PeopleCard.Root>
                                <PeopleCard.Body>
                                    <PeopleCard.Avatar
                                        name="George K. Bassta"
                                        src="/images/landing.avatars.aop5448.webp"
                                    />

                                    <PeopleCard.Title>
                                        George K. Bassta
                                    </PeopleCard.Title>

                                    <PeopleCard.Email email="gkb5393@psu.edu" />

                                    <PeopleCard.Text>
                                        Vice President
                                    </PeopleCard.Text>
                                </PeopleCard.Body>
                            </PeopleCard.Root>

                            <PeopleCard.Root>
                                <PeopleCard.Body>
                                    <PeopleCard.Avatar
                                        name="Ozge S. Ak"
                                        src="/images/landing.avatars.aop5448.webp"
                                    />

                                    <PeopleCard.Title>
                                        Ozge S. Ak
                                    </PeopleCard.Title>

                                    <PeopleCard.Email email="osa5177@psu.edu" />

                                    <PeopleCard.Text>Treasurer</PeopleCard.Text>
                                </PeopleCard.Body>
                            </PeopleCard.Root>

                            <PeopleCard.Root>
                                <PeopleCard.Body>
                                    <PeopleCard.Avatar
                                        name="Dimitri O. Nearchos"
                                        src="/images/landing.avatars.don5092.webp"
                                    />

                                    <PeopleCard.Title>
                                        Dimitri O. Nearchos
                                    </PeopleCard.Title>

                                    <PeopleCard.Email email="don5092@psu.edu" />

                                    <PeopleCard.Text>Secretary</PeopleCard.Text>
                                </PeopleCard.Body>
                            </PeopleCard.Root>
                        </PeopleSection.Grid>
                    </PeopleSection.Body>
                </PeopleSection.Container>
            </PeopleSection.Root>

            <FeedSection.Root>
                <FeedSection.Container>
                    <FeedSection.Body>
                        <FeedSection.Title>Events?</FeedSection.Title>

                        <FeedSection.Description>
                            We got some of those.
                        </FeedSection.Description>

                        <FeedSection.Grid>
                            <FeedCard.Root>
                                <FeedCard.Body>
                                    <FeedCard.Title>
                                        AI Injection Competition
                                    </FeedCard.Title>

                                    <FeedCard.Description>
                                        November 20th, 2025
                                    </FeedCard.Description>

                                    <FeedCard.Text>
                                        Lorem ipsum dolor sit amet, consectetur
                                        adipiscing elit, sed do eiusmod tempor
                                        incididunt ut labore et dolore magnam
                                        aliquam quaerat voluptatem.
                                    </FeedCard.Text>
                                </FeedCard.Body>
                            </FeedCard.Root>

                            <FeedCard.Root>
                                <FeedCard.Body>
                                    <FeedCard.Title>Event 2</FeedCard.Title>

                                    <FeedCard.Description>
                                        November ??th, 2025
                                    </FeedCard.Description>

                                    <FeedCard.Text>
                                        Lorem ipsum dolor sit amet, consectetur
                                        adipiscing elit, sed do eiusmod tempor
                                        incididunt ut labore et dolore magnam
                                        aliquam quaerat voluptatem.
                                    </FeedCard.Text>
                                </FeedCard.Body>
                            </FeedCard.Root>

                            <FeedCard.Root>
                                <FeedCard.Body>
                                    <FeedCard.Title>Event 3</FeedCard.Title>

                                    <FeedCard.Description>
                                        November ??th, 2025
                                    </FeedCard.Description>

                                    <FeedCard.Text>
                                        Lorem ipsum dolor sit amet, consectetur
                                        adipiscing elit, sed do eiusmod tempor
                                        incididunt ut labore et dolore magnam
                                        aliquam quaerat voluptatem.
                                    </FeedCard.Text>
                                </FeedCard.Body>
                            </FeedCard.Root>
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
                            hour in Olmsted XYZ W.
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
                            <FeedCard.Root>
                                <FeedCard.Body>
                                    <FeedCard.Title>
                                        Dots and Boxes AI Competition Winner
                                        Announced!
                                    </FeedCard.Title>

                                    <FeedCard.Description>
                                        September 10th, 2025
                                    </FeedCard.Description>

                                    <FeedCard.Text>
                                        Lorem ipsum dolor sit amet, consectetur
                                        adipiscing elit, sed do eiusmod tempor
                                        incididunt ut labore et dolore magnam
                                        aliquam quaerat voluptatem.
                                    </FeedCard.Text>
                                </FeedCard.Body>
                            </FeedCard.Root>

                            <FeedCard.Root>
                                <FeedCard.Body>
                                    <FeedCard.Title>News 2</FeedCard.Title>

                                    <FeedCard.Description>
                                        September ??th, 2025
                                    </FeedCard.Description>

                                    <FeedCard.Text>
                                        Lorem ipsum dolor sit amet, consectetur
                                        adipiscing elit, sed do eiusmod tempor
                                        incididunt ut labore et dolore magnam
                                        aliquam quaerat voluptatem.
                                    </FeedCard.Text>
                                </FeedCard.Body>
                            </FeedCard.Root>

                            <FeedCard.Root>
                                <FeedCard.Body>
                                    <FeedCard.Title>News 3</FeedCard.Title>

                                    <FeedCard.Description>
                                        September ??th, 2025
                                    </FeedCard.Description>

                                    <FeedCard.Text>
                                        Lorem ipsum dolor sit amet, consectetur
                                        adipiscing elit, sed do eiusmod tempor
                                        incididunt ut labore et dolore magnam
                                        aliquam quaerat voluptatem.
                                    </FeedCard.Text>
                                </FeedCard.Body>
                            </FeedCard.Root>
                        </FeedSection.Grid>
                    </FeedSection.Body>
                </FeedSection.Container>
            </FeedSection.Root>
        </>
    );
}
