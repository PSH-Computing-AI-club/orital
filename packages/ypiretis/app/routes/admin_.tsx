import {Spacer} from "@chakra-ui/react";

import {Outlet, data} from "react-router";

import {
    mapPublicUser,
    requireAuthenticatedSession,
} from "~/.server/services/users_service";

import Separator from "~/components/common/separator";

import Layout from "~/components/controlpanel/layout";
import Sidebar from "~/components/controlpanel/sidebar";

import DashboardIcon from "~/components/icons/dashboard_icon";
import CalendarTextIcon from "~/components/icons/calendar_text_icon";
import HomeIcon from "~/components/icons/home_icon";
import TextIcon from "~/components/icons/text_icon";

import {PublicUserContextProvider} from "~/state/public_user";

import {Route} from "./+types/admin_";

export async function loader(loaderArgs: Route.LoaderArgs) {
    const session = await requireAuthenticatedSession(loaderArgs);

    if (!session) {
        throw data("Unauthorized", {
            status: 401,
        });
    }

    const {identifiable: user} = session;
    const {isAdmin} = user;

    if (!isAdmin) {
        throw data("Unauthorized", {
            status: 401,
        });
    }

    const publicUser = mapPublicUser(session.identifiable);

    return {
        publicUser,
    };
}

function SidebarView() {
    return (
        <Sidebar.Root>
            <Sidebar.Container>
                <Sidebar.Link to={`/admin`}>
                    <Sidebar.Icon>
                        <DashboardIcon />
                    </Sidebar.Icon>
                    Dashboard
                </Sidebar.Link>

                <Sidebar.Link to={`/admin/news`} comparator="startsWith">
                    <Sidebar.Icon>
                        <TextIcon />
                    </Sidebar.Icon>
                    News
                </Sidebar.Link>

                <Sidebar.Link to={`/admin/events`} comparator="startsWith">
                    <Sidebar.Icon>
                        <CalendarTextIcon />
                    </Sidebar.Icon>
                    Events
                </Sidebar.Link>

                <Spacer />

                <Separator.Horizontal />

                <Sidebar.Link to="/" colorPalette="red">
                    <Sidebar.Icon>
                        <HomeIcon />
                    </Sidebar.Icon>
                    Landing Page
                </Sidebar.Link>
            </Sidebar.Container>
        </Sidebar.Root>
    );
}

export default function AdminLayout(props: Route.ComponentProps) {
    const {loaderData} = props;
    const {publicUser} = loaderData;

    return (
        <Layout.Root>
            <PublicUserContextProvider publicUser={publicUser}>
                <SidebarView />

                <Outlet />
            </PublicUserContextProvider>
        </Layout.Root>
    );
}
