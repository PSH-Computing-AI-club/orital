import {redirect} from "react-router";

import ENVIRONMENT from "~/.server/configuration/environment";

const {ENGAGE_ORGANIZATION_IDENTIFIER} = ENVIRONMENT;

const ENGAGE_ORGANIZATION_URL = new URL(
    ENGAGE_ORGANIZATION_IDENTIFIER,
    "https://psuharrisburg.campuslabs.com/engage/organization/",
);

export async function loader() {
    console.log({ENGAGE_ORGANIZATION_URL: ENGAGE_ORGANIZATION_URL.toString()});

    return redirect(ENGAGE_ORGANIZATION_URL.toString());
}
