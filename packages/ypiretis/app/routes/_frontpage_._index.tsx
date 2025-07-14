import {Container, Span, VisuallyHidden} from "@chakra-ui/react";

import {Suspense, lazy} from "react";

import {ClientOnly} from "remix-utils/client-only";

import {findAllPublished} from "~/.server/services/articles_service";
import {renderMarkdownForPlaintext} from "~/.server/services/markdown";

import {FORMAT_DETAIL, formatZonedDateTime} from "~/.server/utils/locale";
import {transformTextToSnippet} from "~/.server/utils/string";
import {SYSTEM_TIMEZONE} from "~/.server/utils/temporal";

import Title from "~/components/common/title";

import ActionCard from "~/components/frontpage/action_card";
import Background3DGrid from "~/components/frontpage/background_3d_grid";
import FeedCard from "~/components/frontpage/feed_card";
import FeedSection from "~/components/frontpage/feed_section";
import FeatureSection from "~/components/frontpage/feature_section";
import FullscreenHero from "~/components/frontpage/fullscreen_hero";
import PeopleCard from "~/components/frontpage/people_card";
import PeopleSection from "~/components/frontpage/people_section";

import ArrowRightIcon from "~/components/icons/arrow_right_icon";

import {APP_NAME} from "~/utils/constants";

import type {Route} from "./+types/_frontpage_._index";

const ARTICLE_DESCRIPTION_CHARACTER_LIMIT = 192;

const ARTICLES_TO_DISPLAY = 3;

const PEOPLE_TO_DISPLAY = [
    {
        accountID: "aop5448",
        name: "Alexander O. Petrov",
        role: "President",
    },

    {
        accountID: "gkb5393",
        name: "George K. Bassta",
        role: "Vice President",
    },

    {
        accountID: "osa5177",
        name: "Ozge S. Ak",
        role: "Treasurer",
    },

    {
        accountID: "don5092",
        name: "Dimitri O. Nearchos",
        role: "Secretary",
    },
] as const;

const AnimatedLogo = lazy(() => import("~/components/frontpage/animated_logo"));

export async function loader(_loaderArgs: Route.LoaderArgs) {
    const {articles} = await findAllPublished({
        pagination: {
            page: 1,

            limit: ARTICLES_TO_DISPLAY,
        },
    });

    const mappedArticles = await Promise.all(
        articles.map(async (article) => {
            const {articleID, content, slug, publishedAt, title} = article;

            const zonedPublishedAt =
                publishedAt.toZonedDateTimeISO(SYSTEM_TIMEZONE);

            const publishedAtTimestamp = formatZonedDateTime(zonedPublishedAt, {
                detail: FORMAT_DETAIL.short,
            });

            const plaintextContent = await renderMarkdownForPlaintext(content);
            const description = transformTextToSnippet(plaintextContent, {
                limit: ARTICLE_DESCRIPTION_CHARACTER_LIMIT,
            });

            const {year, month, day} = zonedPublishedAt;

            return {
                articleID,
                day,
                description,
                month,
                publishedAtTimestamp,
                slug,
                title,
                year,
            };
        }),
    );

    return {
        articles: mappedArticles,
        people: PEOPLE_TO_DISPLAY,
    };
}

export default function FrontpageIndex(props: Route.ComponentProps) {
    const {loaderData} = props;
    const {articles, people} = loaderData;

    return (
        <>
            <Title />

            <VisuallyHidden as="div">
                <h1>{APP_NAME}</h1>
            </VisuallyHidden>

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
                    <FeatureSection.Image
                        src="/images/landing.psh.webp"
                        alt="3D voxel art of the Penn State Harrisburg logo."
                    />

                    <FeatureSection.Body>
                        <FeatureSection.Title>
                            We Are{" "}
                            <Span>
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
                            {people.map((article) => {
                                const {accountID, name, role} = article;

                                return (
                                    <PeopleSection.GridItem key={accountID}>
                                        <PeopleCard.Root>
                                            <PeopleCard.Body>
                                                <PeopleCard.Avatar
                                                    name={name}
                                                    src={`/images/landing.avatars.${accountID}.webp`}
                                                />

                                                <PeopleCard.Title>
                                                    {name}
                                                </PeopleCard.Title>

                                                <PeopleCard.Email
                                                    email={`${accountID}@psu.edu`}
                                                />

                                                <PeopleCard.Text>
                                                    {role}
                                                </PeopleCard.Text>
                                            </PeopleCard.Body>
                                        </PeopleCard.Root>
                                    </PeopleSection.GridItem>
                                );
                            })}
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
                            <FeedSection.GridItem>
                                <FeedCard.Root>
                                    <FeedCard.Body>
                                        <FeedCard.Title>
                                            AI Injection Competition
                                        </FeedCard.Title>

                                        <FeedCard.Description>
                                            November 20th, 2025
                                        </FeedCard.Description>

                                        <FeedCard.Text>
                                            Lorem ipsum dolor sit amet,
                                            consectetur adipiscing elit, sed do
                                            eiusmod tempor incididunt ut labore
                                            et dolore magnam aliquam quaerat
                                            voluptatem.
                                        </FeedCard.Text>
                                    </FeedCard.Body>
                                </FeedCard.Root>
                            </FeedSection.GridItem>

                            <FeedSection.GridItem>
                                <FeedCard.Root>
                                    <FeedCard.Body>
                                        <FeedCard.Title>Event 2</FeedCard.Title>

                                        <FeedCard.Description>
                                            November ??th, 2025
                                        </FeedCard.Description>

                                        <FeedCard.Text>
                                            Lorem ipsum dolor sit amet,
                                            consectetur adipiscing elit, sed do
                                            eiusmod tempor incididunt ut labore
                                            et dolore magnam aliquam quaerat
                                            voluptatem.
                                        </FeedCard.Text>
                                    </FeedCard.Body>
                                </FeedCard.Root>
                            </FeedSection.GridItem>

                            <FeedSection.GridItem>
                                <FeedCard.Root>
                                    <FeedCard.Body>
                                        <FeedCard.Title>Event 3</FeedCard.Title>

                                        <FeedCard.Description>
                                            November ??th, 2025
                                        </FeedCard.Description>

                                        <FeedCard.Text>
                                            Lorem ipsum dolor sit amet,
                                            consectetur adipiscing elit, sed do
                                            eiusmod tempor incididunt ut labore
                                            et dolore magnam aliquam quaerat
                                            voluptatem.
                                        </FeedCard.Text>
                                    </FeedCard.Body>
                                </FeedCard.Root>
                            </FeedSection.GridItem>

                            <FeedSection.GridItem variant="action">
                                <ActionCard.Root>
                                    <ActionCard.Icon>
                                        <ArrowRightIcon />
                                    </ActionCard.Icon>

                                    <ActionCard.Link to="/events">
                                        View More
                                    </ActionCard.Link>
                                </ActionCard.Root>
                            </FeedSection.GridItem>
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

                    <FeatureSection.Image
                        src="/images/landing.calendar.webp"
                        alt="3D voxel art of a calendar."
                    />
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
                            {articles.map((article) => {
                                const {
                                    articleID,
                                    day,
                                    description,
                                    month,
                                    publishedAtTimestamp,
                                    title,
                                    slug,
                                    year,
                                } = article;

                                return (
                                    <FeedSection.GridItem key={articleID}>
                                        <FeedCard.Root>
                                            <FeedCard.Body>
                                                <FeedCard.Title
                                                    to={`/news/articles/${articleID}/${year}/${month}/${day}/${slug}`}
                                                >
                                                    {title}
                                                </FeedCard.Title>

                                                <FeedCard.Description>
                                                    {publishedAtTimestamp}
                                                </FeedCard.Description>

                                                <FeedCard.Text>
                                                    {description}
                                                </FeedCard.Text>
                                            </FeedCard.Body>
                                        </FeedCard.Root>
                                    </FeedSection.GridItem>
                                );
                            })}

                            <FeedSection.GridItem variant="action">
                                <ActionCard.Root>
                                    <ActionCard.Icon>
                                        <ArrowRightIcon />
                                    </ActionCard.Icon>

                                    <ActionCard.Link to="/news">
                                        View More
                                    </ActionCard.Link>
                                </ActionCard.Root>
                            </FeedSection.GridItem>
                        </FeedSection.Grid>
                    </FeedSection.Body>
                </FeedSection.Container>
            </FeedSection.Root>
        </>
    );
}
