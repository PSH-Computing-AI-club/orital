import {redirect} from "react-router";

import ENVIRONMENT from "~/.server/configuration/environment";

const {DISCORD_INVITE_CODE} = ENVIRONMENT;

const DISCORD_INVITE_URL = new URL(DISCORD_INVITE_CODE, "https://discord.gg/");

export async function loader() {
    return redirect(DISCORD_INVITE_URL.toString());
}
