import {Box} from "@chakra-ui/react";

import CloseIcon from "~/components/icons/close_icon";
import DashboardIcon from "~/components/icons/dashboard_icon";
import ChartIcon from "~/components/icons/chart_icon";
import SlidersIcon from "~/components/icons/sliders_icon";

import AppShell from "~/components/shell/app_shell";

import {Route} from "./+types/rooms.$roomID.presenter._index";

export default function RoomsPresenterIndex(props: Route.ComponentProps) {
    return (
        <AppShell.Root>
            <AppShell.Sidebar>
                <AppShell.Link to="/" active>
                    <AppShell.Icon>
                        <DashboardIcon />
                    </AppShell.Icon>
                    Dashboard
                </AppShell.Link>

                <AppShell.Link to="/">
                    <AppShell.Icon>
                        <ChartIcon />
                    </AppShell.Icon>
                    Polls
                </AppShell.Link>

                <AppShell.Divider />

                <AppShell.Link to="/">
                    <AppShell.Icon>
                        <SlidersIcon />
                    </AppShell.Icon>
                    Settings
                </AppShell.Link>

                <AppShell.Button
                    colorPalette="red"
                    onClick={() => console.log("hello world!")}
                >
                    <AppShell.Icon>
                        <CloseIcon />
                    </AppShell.Icon>
                    Close Room
                </AppShell.Button>
            </AppShell.Sidebar>

            <AppShell.Container>Stuff will happun here!</AppShell.Container>
        </AppShell.Root>
    );
}
