import {data, redirect} from "react-router";

import * as v from "valibot";

import {eq} from "~/.server/services/crud_service.filters";
import {findOnePublished} from "~/.server/services/events_service";

import {ulid} from "~/.server/utils/valibot";

import {validateParams} from "~/guards/validation";

import {NAVIGATOR_TIMEZONE} from "~/utils/navigator";

import {Route} from "./+types/_frontpage_.calendar_.events_.$eventID_.$";

const LOADER_PARAMS_SCHEMA = v.object({
    eventID: ulid,
});

export async function loader(loaderArgs: Route.LoaderArgs) {
    const {eventID} = validateParams(LOADER_PARAMS_SCHEMA, loaderArgs);

    const event = await findOnePublished({
        where: eq("eventID", eventID),
    });

    if (event === null) {
        throw data("Not Found", {
            status: 404,
        });
    }

    const {publishedAt, slug} = event;
    const {day, month, year} =
        publishedAt.toZonedDateTimeISO(NAVIGATOR_TIMEZONE);

    return redirect(
        `/calendar/events/${eventID}/${year}/${month}/${day}/${slug}`,
        {
            status: 301,
        },
    );
}
