import {redirect} from "react-router";

import RUNTIME_ENVIRONMENT from "~/.server/configuration/runtime_environment";

const {DISCORD_INVITE_CODE} = RUNTIME_ENVIRONMENT;

const DISCORD_INVITE_URL = new URL(DISCORD_INVITE_CODE, "https://discord.gg/");

export async function loader() {
    return redirect(DISCORD_INVITE_URL.toString());
}
