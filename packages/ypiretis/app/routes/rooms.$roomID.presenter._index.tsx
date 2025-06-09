import AppShell from "~/components/shell/app_shell";

import {Route} from "./+types/rooms.$roomID.presenter._index";

export default function RoomsPresenterIndex(props: Route.ComponentProps) {
    return (
        <AppShell.Container>
            Stuff will happun here at da index!
        </AppShell.Container>
    );
}
