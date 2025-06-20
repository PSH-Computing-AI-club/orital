import {Outlet, data} from "react-router";

import {requireGuestSession} from "~/.server/services/users_service";

import PromptShell from "~/components/shell/prompt_shell";

import type {Route} from "./+types/authentication_";

export async function loader(loaderArgs: Route.LoaderArgs) {
    const {request} = loaderArgs;
    const url = new URL(request.url);

    if (url.pathname === "/authentication") {
        throw data("Not Found", {
            status: 404,
        });
    }

    await requireGuestSession(request);
}

export default function AuthenticationLayout(_props: Route.ErrorBoundaryProps) {
    return (
        <PromptShell.Root>
            <PromptShell.Sidebar />

            <PromptShell.Container>
                <Outlet />
            </PromptShell.Container>
        </PromptShell.Root>
    );
}
