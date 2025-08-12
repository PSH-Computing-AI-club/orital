import {redirect} from "react-router";

import RUNTIME_ENVIRONMENT from "~/.server/configuration/runtime_environment";

const {GITHUB_ORGANIZATION_IDENTIFIER} = RUNTIME_ENVIRONMENT;

const GITHUB_ORGANIZATION_URL = new URL(
    GITHUB_ORGANIZATION_IDENTIFIER,
    "https://github.com/",
);

export async function loader() {
    return redirect(GITHUB_ORGANIZATION_URL.toString());
}
