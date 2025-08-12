import {redirect} from "react-router";

import ENVIRONMENT from "~/.server/configuration/environment";

const {DISCOVER_EAST_ORGANIZATION_IDENTIFIER} = ENVIRONMENT;

const DISCOVER_EAST_ORGANIZATION_URL = new URL(
    DISCOVER_EAST_ORGANIZATION_IDENTIFIER,
    "https://discovereast.psu.edu/organization/",
);

export async function loader() {
    return redirect(DISCOVER_EAST_ORGANIZATION_URL.toString());
}
