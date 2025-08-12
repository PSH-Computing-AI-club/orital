import {redirect} from "react-router";

import RUNTIME_ENVIRONMENT from "~/.server/configuration/runtime_environment";

const {DISCOVER_EAST_ORGANIZATION_IDENTIFIER} = RUNTIME_ENVIRONMENT;

const DISCOVER_EAST_ORGANIZATION_URL = new URL(
    DISCOVER_EAST_ORGANIZATION_IDENTIFIER,
    "https://discovereast.psu.edu/organization/",
);

export async function loader() {
    return redirect(DISCOVER_EAST_ORGANIZATION_URL.toString());
}
