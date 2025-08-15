import {Outlet, data} from "react-router";

import PromptShell from "~/components/shell/prompt_shell";

import type {Route} from "./+types/authentication_";

export async function loader(loaderArgs: Route.LoaderArgs) {
    const {request} = loaderArgs;
    const {url} = request;

    const {pathname} = new URL(url);

    if (pathname === "/authentication") {
        throw data("Not Found", {
            status: 404,
        });
    }
}

export default function AuthenticationLayout() {
    return (
        <PromptShell.Root>
            <PromptShell.Sidebar />

            <PromptShell.Container>
                <Outlet />
            </PromptShell.Container>
        </PromptShell.Root>
    );
}
