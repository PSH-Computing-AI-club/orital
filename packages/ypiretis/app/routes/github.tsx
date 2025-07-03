import {redirect} from "react-router";

import ENVIRONMENT from "~/.server/configuration/environment";

const {GITHUB_ORGANIZATION_IDENTIFIER} = ENVIRONMENT;

const GITHUB_ORGANIZATION_URL = new URL(
    GITHUB_ORGANIZATION_IDENTIFIER,
    "https://github.com/",
);

export async function loader() {
    return redirect(GITHUB_ORGANIZATION_URL.toString());
}
