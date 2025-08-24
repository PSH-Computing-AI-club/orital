import {Container, Flex, Span, VisuallyHidden, VStack} from "@chakra-ui/react";

import {Suspense, lazy} from "react";

import {useLoaderData} from "react-router";

import {ClientOnly} from "remix-utils/client-only";

import {findAllPublished as findAllArticlesPublished} from "~/.server/services/articles_service";
import {SORT_MODES} from "~/.server/services/crud_service";
import {findAllPublishedFeed as findAllEventsPublishedFeed} from "~/.server/services/events_service";
import {renderMarkdownForPlaintext} from "~/.server/services/markdown";

import DatetimeText from "~/components/common/datetime_text";
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
import CalendarTextIcon from "~/components/icons/calendar_text_icon";
import DatetimeRangeText from "~/components/common/datetime_range_text";
import PinIcon from "~/components/icons/pin_icon";

import {
    ACCOUNT_PROVIDER_DOMAIN,
    APP_NAME,
    SERVER_TIMEZONE,
} from "~/utils/constants";
import {normalizeSpacing, truncateTextRight} from "~/utils/string";

import type {Route} from "./+types/_frontpage_._index";

const ARTICLE_DESCRIPTION_CHARACTER_LIMIT = 256;

const EVENT_DESCRIPTION_CHARACTER_LIMIT = 256;

const ARTICLES_TO_DISPLAY = 3;

const PEOPLE_TO_DISPLAY = [
    {
        accountID: "aop5448",
        fullName: "Alexander O. Petrov",
        role: "President",
    },

    {
        accountID: "gkb5393",
        fullName: "George K. Bassta",
        role: "Vice President",
    },

    {
        accountID: "osa5177",
        fullName: "Ozge S. Ak",
        role: "Treasurer",
    },

    {
        accountID: "don5092",
        fullName: "Dimitri O. Nearchos",
        role: "Secretary",
    },
] as const;

const AnimatedLogo = lazy(() => import("~/components/frontpage/animated_logo"));

export async function loader(_loaderArgs: Route.LoaderArgs) {
    const [articles, events] = await Promise.all([
        findAllArticlesPublished({
            limit: ARTICLES_TO_DISPLAY,

            sort: {
                by: "publishedAt",
                mode: SORT_MODES.descending,
            },
        }),

        findAllEventsPublishedFeed(),
    ]);

    const mappedArticles = await Promise.all(
        articles.map(async (article) => {
            const {articleID, content, slug, publishedAt, title} = article;

            const zonedPublishedAt =
                publishedAt.toZonedDateTimeISO(SERVER_TIMEZONE);

            const plaintextContent = await renderMarkdownForPlaintext(content);
            const description = normalizeSpacing(
                truncateTextRight(
                    plaintextContent,
                    ARTICLE_DESCRIPTION_CHARACTER_LIMIT,
                ),
            );

            const {epochMilliseconds: publishedAtTimestamp} = publishedAt;
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

    const mappedEvents = await Promise.all(
        events.map(async (event) => {
            const {content, endAt, eventID, location, slug, startAt, title} =
                event;

            const zonedPublishedAt =
                startAt.toZonedDateTimeISO(SERVER_TIMEZONE);

            const plaintextContent = await renderMarkdownForPlaintext(content);
            const description = normalizeSpacing(
                truncateTextRight(
                    plaintextContent,
                    EVENT_DESCRIPTION_CHARACTER_LIMIT,
                ),
            );

            const endAtTimestamp = endAt?.epochMilliseconds ?? null;
            const {epochMilliseconds: startAtTimestamp} = startAt;

            const {year, month, day} = zonedPublishedAt;

            return {
                day,
                description,
                endAtTimestamp,
                eventID,
                location,
                month,
                startAtTimestamp,
                slug,
                title,
                year,
            };
        }),
    );

    return {
        articles: mappedArticles,
        events: mappedEvents,
        people: PEOPLE_TO_DISPLAY,
    };
}

function NewsFeed() {
    const {articles} = useLoaderData<typeof loader>();

    return (
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
                                                <DatetimeText
                                                    detail="short"
                                                    timestamp={
                                                        publishedAtTimestamp
                                                    }
                                                />
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
    );
}

function MeetingsDetails() {
    return (
        <FeatureSection.Root>
            <FeatureSection.Container>
                <FeatureSection.Body>
                    <FeatureSection.Title>
                        Bi-Weekly Meetings
                    </FeatureSection.Title>

                    <FeatureSection.Description>
                        To promote club camaraderie, the Computing and AI Club
                        hosts bi-weekly meetings every Monday @{" "}
                        <Span whiteSpace="pre">11:15 AM</Span> in{" "}
                        <Span whiteSpace="pre">Olmsted W209</Span> starting from
                        September 8th.
                    </FeatureSection.Description>
                </FeatureSection.Body>

                <FeatureSection.Image
                    src="/images/landing.calendar.webp"
                    alt="3D voxel art of a calendar."
                />
            </FeatureSection.Container>
        </FeatureSection.Root>
    );
}

function EventsFeed() {
    const {events} = useLoaderData<typeof loader>();

    return (
        <FeedSection.Root>
            <FeedSection.Container>
                <FeedSection.Body>
                    <FeedSection.Title>Events?</FeedSection.Title>

                    <FeedSection.Description>
                        We got some of those.
                    </FeedSection.Description>

                    <FeedSection.Grid>
                        {events.map((event) => {
                            const {
                                day,
                                description,
                                endAtTimestamp,
                                eventID,
                                location,
                                month,
                                title,
                                slug,
                                startAtTimestamp,
                                year,
                            } = event;

                            return (
                                <FeedSection.GridItem key={eventID}>
                                    <FeedCard.Root>
                                        <FeedCard.Body>
                                            <FeedCard.Title
                                                to={`/calendar/events/${eventID}/${year}/${month}/${day}/${slug}`}
                                            >
                                                {title}
                                            </FeedCard.Title>

                                            <FeedCard.Description>
                                                <VStack
                                                    gap="1"
                                                    alignItems="start"
                                                >
                                                    <Flex lineHeight="short">
                                                        <CalendarTextIcon />
                                                        &nbsp;
                                                        {endAtTimestamp ? (
                                                            <DatetimeRangeText
                                                                startAtTimestamp={
                                                                    startAtTimestamp
                                                                }
                                                                endAtTimestamp={
                                                                    endAtTimestamp
                                                                }
                                                                detail="short"
                                                            />
                                                        ) : (
                                                            <DatetimeText
                                                                timestamp={
                                                                    startAtTimestamp
                                                                }
                                                                detail="short"
                                                            />
                                                        )}
                                                    </Flex>

                                                    <Flex lineHeight="short">
                                                        <PinIcon />
                                                        &nbsp;
                                                        {location ?? "TBD"}
                                                    </Flex>
                                                </VStack>
                                            </FeedCard.Description>

                                            <FeedCard.Text lineClamp={4}>
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

                                <ActionCard.Link to="/calendar">
                                    View More
                                </ActionCard.Link>
                            </ActionCard.Root>
                        </FeedSection.GridItem>
                    </FeedSection.Grid>
                </FeedSection.Body>
            </FeedSection.Container>
        </FeedSection.Root>
    );
}

function ClubOfficerList() {
    const {people} = useLoaderData<typeof loader>();

    return (
        <PeopleSection.Root>
            <PeopleSection.Container>
                <PeopleSection.Body>
                    <PeopleSection.Title>Club Officers</PeopleSection.Title>

                    <PeopleSection.Description>
                        We are also ourselves!
                    </PeopleSection.Description>

                    <PeopleSection.Grid>
                        {people.map((person) => {
                            const {accountID, fullName, role} = person;

                            const avatarSrc = `/images/avatars.${accountID}.webp`;
                            const email = `${accountID}@${ACCOUNT_PROVIDER_DOMAIN}`;

                            return (
                                <PeopleSection.GridItem key={accountID}>
                                    <PeopleCard.Root>
                                        <PeopleCard.Body>
                                            <PeopleCard.Avatar
                                                name={fullName}
                                                src={avatarSrc}
                                            />

                                            <address>
                                                <PeopleCard.Title>
                                                    {fullName}
                                                </PeopleCard.Title>

                                                <PeopleCard.Email
                                                    email={email}
                                                />

                                                <PeopleCard.Text>
                                                    {role}
                                                </PeopleCard.Text>
                                            </address>
                                        </PeopleCard.Body>
                                    </PeopleCard.Root>
                                </PeopleSection.GridItem>
                            );
                        })}
                    </PeopleSection.Grid>
                </PeopleSection.Body>
            </PeopleSection.Container>
        </PeopleSection.Root>
    );
}

function ClubBio() {
    return (
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
                            <Span whiteSpace="pre">Penn State</Span> Harrisburg!
                        </Span>
                    </FeatureSection.Title>

                    <FeatureSection.Description>
                        The Computing and AI Club provides a friendly atmosphere
                        for all PSH students to network, hone their skills, and
                        to have fun all things computing.
                    </FeatureSection.Description>
                </FeatureSection.Body>
            </FeatureSection.Container>
        </FeatureSection.Root>
    );
}

function AnimatedBanner() {
    return (
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
    );
}

export default function FrontpageIndex() {
    return (
        <>
            <Title />

            <VisuallyHidden as="div">
                <h1>{APP_NAME}</h1>
            </VisuallyHidden>

            <AnimatedBanner />
            <ClubBio />
            <ClubOfficerList />
            <EventsFeed />
            <MeetingsDetails />
            <NewsFeed />
        </>
    );
}
