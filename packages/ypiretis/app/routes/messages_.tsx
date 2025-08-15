import {Outlet} from "react-router";

import PromptShell from "~/components/shell/prompt_shell";

export default function MessagesLayout() {
    return (
        <PromptShell.Root>
            <PromptShell.Sidebar />

            <PromptShell.Container>
                <Outlet />
            </PromptShell.Container>
        </PromptShell.Root>
    );
}
