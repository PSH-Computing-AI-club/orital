import {Button, Code, IconButton, Spacer, Table} from "@chakra-ui/react";

import {
    Form,
    Link as RouterLink,
    data,
    redirect,
    useNavigation,
} from "react-router";

import * as v from "valibot";

import {SORT_MODES} from "~/.server/services/crud_service";
import {
    EVENT_STATES,
    findPaginatedAllWithPoster,
    insertOne,
} from "~/.server/services/events_service";
import {requireAuthenticatedAdminSession} from "~/.server/services/users_service";

import DatetimeText from "~/components/common/datetime_text";
import type {IPaginationTemplate} from "~/components/common/pagination";
import Pagination from "~/components/common/pagination";

import Layout from "~/components/controlpanel/layout";
import Title from "~/components/controlpanel/title";

import CalendarPlusIcon from "~/components/icons/calendar_plus_icon";
import EditIcon from "~/components/icons/edit_icon";

import {validateFormData, validateParams} from "~/guards/validation";

import {number} from "~/utils/valibot";

import {Route} from "./+types/admin_.calendar.($page)";

const EVENTS_PER_PAGE = 25;

const PAGINATION_PAGE_RANGE = 3;

const PAGINATION_URL_TEMPLATE = (({page}) =>
    `/admin/calendar/${page}`) satisfies IPaginationTemplate;

const ACTION_FORM_DATA_SCHEMA = v.object({
    action: v.pipe(v.string(), v.picklist(["create"])),
});

const LOADER_PARAMS_SCHEMA = v.object({
    page: v.optional(number),
});

export async function action(actionArgs: Route.ActionArgs) {
    const {action} = await validateFormData(
        ACTION_FORM_DATA_SCHEMA,
        actionArgs,
    );

    const {identifiable: user} =
        await requireAuthenticatedAdminSession(actionArgs);

    const {id: userID} = user;

    switch (action) {
        case "create": {
            const {eventID} = await insertOne({
                values: {
                    content: "",
                    posterUserID: userID,
                    state: EVENT_STATES.draft,
                    title: "Untitled Event",
                },
            });

            return redirect(`/admin/calendar/events/${eventID}`);
        }
    }
}

export async function loader(loaderArgs: Route.LoaderArgs) {
    const {page = 1} = validateParams(LOADER_PARAMS_SCHEMA, loaderArgs);

    const {pagination, values: events} = await findPaginatedAllWithPoster({
        pagination: {
            page,

            limit: EVENTS_PER_PAGE,
        },

        sort: {
            by: "id",
            mode: SORT_MODES.descending,
        },
    });

    const {pages} = pagination;

    if (page > pages) {
        throw data("Not Found", {
            status: 404,
        });
    }

    const mappedEvents = await Promise.all(
        events.map(async (event) => {
            const {
                createdAt,
                endAt,
                eventID,
                location,
                poster,
                publishedAt,
                slug,
                startAt,
                state,
                title,
                updatedAt,
            } = event;

            const {accountID, firstName, lastName} = poster;

            const {epochMilliseconds: createdAtTimestamp} = createdAt;
            const {epochMilliseconds: updatedAtTimestamp} = updatedAt;

            const endAtTimestamp = endAt?.epochMilliseconds ?? null;
            const publishedAtTimestamp = publishedAt?.epochMilliseconds ?? null;
            const startAtTimestamp = startAt?.epochMilliseconds ?? null;

            return {
                createdAtTimestamp,
                endAtTimestamp,
                eventID,
                location,

                poster: {
                    accountID,
                    firstName,
                    lastName,
                },

                publishedAtTimestamp,
                slug,
                startAtTimestamp,
                state,
                title,
                updatedAtTimestamp,
            };
        }),
    );

    return {
        events: mappedEvents,
        pagination,
    };
}

export default function AdminNews(props: Route.ComponentProps) {
    const {loaderData} = props;
    const {events, pagination} = loaderData;

    const {page, pages} = pagination;

    const navigation = useNavigation();

    return (
        <Layout.FixedContainer>
            <Title.Text title={`Calendar Events Page ${page}`}>
                <Spacer />
                <Form method="POST">
                    <Button
                        disabled={navigation.state !== "idle"}
                        colorPalette="green"
                        type="submit"
                        name="action"
                        value="create"
                    >
                        Create Calendar Event
                        <CalendarPlusIcon />
                    </Button>
                </Form>
            </Title.Text>

            <Table.ScrollArea
                borderColor="border"
                borderStyle="solid"
                borderWidth="thin"
            >
                <Table.Root showColumnBorder stickyHeader>
                    <Table.Header>
                        <Table.Row
                            css={{
                                _after: {
                                    display: "block",
                                    content: '""',

                                    blockSize: "1px",
                                    inlineSize: "full",

                                    position: "absolute",
                                    insetBlockEnd: "0",
                                    insetInlineStart: "0",

                                    bg: "border",
                                },
                            }}
                        >
                            <Table.ColumnHeader fontWeight="bold">
                                Actions
                            </Table.ColumnHeader>

                            <Table.ColumnHeader fontWeight="bold">
                                Event ID
                            </Table.ColumnHeader>

                            <Table.ColumnHeader fontWeight="bold">
                                Title
                            </Table.ColumnHeader>

                            <Table.ColumnHeader fontWeight="bold">
                                Poster
                            </Table.ColumnHeader>

                            <Table.ColumnHeader fontWeight="bold">
                                State
                            </Table.ColumnHeader>

                            <Table.ColumnHeader fontWeight="bold">
                                Start Date
                            </Table.ColumnHeader>

                            <Table.ColumnHeader fontWeight="bold">
                                End Date
                            </Table.ColumnHeader>

                            <Table.ColumnHeader fontWeight="bold">
                                Location
                            </Table.ColumnHeader>

                            <Table.ColumnHeader fontWeight="bold">
                                Published Date
                            </Table.ColumnHeader>

                            <Table.ColumnHeader fontWeight="bold">
                                Created Date
                            </Table.ColumnHeader>

                            <Table.ColumnHeader fontWeight="bold">
                                Updated Date
                            </Table.ColumnHeader>
                        </Table.Row>
                    </Table.Header>

                    <Table.Body>
                        {events.map((event, _index) => {
                            const {
                                createdAtTimestamp,
                                endAtTimestamp,
                                eventID,
                                location,
                                poster,
                                publishedAtTimestamp,
                                startAtTimestamp,
                                state,
                                title,
                                updatedAtTimestamp,
                            } = event;

                            const {accountID, firstName, lastName} = poster;

                            return (
                                <Table.Row key={eventID}>
                                    <Table.Cell textAlign="center">
                                        <IconButton
                                            variant="ghost"
                                            colorPalette="cyan"
                                            size="xs"
                                            asChild
                                        >
                                            <RouterLink
                                                to={`/admin/calendar/events/${eventID}`}
                                            >
                                                <EditIcon />
                                            </RouterLink>
                                        </IconButton>
                                    </Table.Cell>

                                    <Table.Cell>
                                        <Code>{eventID}</Code>
                                    </Table.Cell>

                                    <Table.Cell>{title}</Table.Cell>

                                    <Table.Cell>
                                        {lastName}, {firstName} (
                                        <Code>{accountID}</Code>)
                                    </Table.Cell>

                                    <Table.Cell>
                                        {state === "STATE_DRAFT"
                                            ? "draft"
                                            : "published"}
                                    </Table.Cell>

                                    <Table.Cell>
                                        {startAtTimestamp ? (
                                            <DatetimeText
                                                detail="long"
                                                timestamp={startAtTimestamp}
                                            />
                                        ) : (
                                            "-"
                                        )}
                                    </Table.Cell>

                                    <Table.Cell>
                                        {endAtTimestamp ? (
                                            <DatetimeText
                                                detail="long"
                                                timestamp={endAtTimestamp}
                                            />
                                        ) : (
                                            "-"
                                        )}
                                    </Table.Cell>

                                    <Table.Cell>
                                        {<>{location ?? "-"}</>}
                                    </Table.Cell>

                                    <Table.Cell>
                                        {publishedAtTimestamp ? (
                                            <DatetimeText
                                                detail="long"
                                                timestamp={publishedAtTimestamp}
                                            />
                                        ) : (
                                            "-"
                                        )}
                                    </Table.Cell>

                                    <Table.Cell>
                                        <DatetimeText
                                            detail="long"
                                            timestamp={createdAtTimestamp}
                                        />
                                    </Table.Cell>

                                    <Table.Cell>
                                        <DatetimeText
                                            detail="long"
                                            timestamp={updatedAtTimestamp}
                                        />
                                    </Table.Cell>
                                </Table.Row>
                            );
                        })}
                    </Table.Body>
                </Table.Root>
            </Table.ScrollArea>

            <Spacer />

            <Pagination
                currentPage={page}
                pageRange={PAGINATION_PAGE_RANGE}
                pages={pages}
                template={PAGINATION_URL_TEMPLATE}
            />
        </Layout.FixedContainer>
    );
}
