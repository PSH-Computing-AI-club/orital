import {Spacer, Strong, Text} from "@chakra-ui/react";

import {Outlet, data} from "react-router";

import {
    mapPublicUser,
    requireAuthenticatedSession,
} from "~/.server/services/users_service";

import Separator from "~/components/common/separator";

import Layout from "~/components/controlpanel/layout";
import Sidebar from "~/components/controlpanel/sidebar";

import ArticleMultipleIcon from "~/components/icons/article_multiple_icon";
import CalendarMultipleIcon from "~/components/icons/calendar_multiple_icon";
import DashboardIcon from "~/components/icons/dashboard_icon";
import HomeIcon from "~/components/icons/home_icon";

import {PublicUserContextProvider} from "~/state/public_user";

import {Route} from "./+types/admin_";

export function clientLoader(loaderArgs: Route.ClientLoaderArgs) {
    return loaderArgs.serverLoader();
}

clientLoader.hydrate = true as const;

export async function loader(loaderArgs: Route.LoaderArgs) {
    const {identifiable: user} = await requireAuthenticatedSession(loaderArgs);

    const {isAdmin} = user;

    if (!isAdmin) {
        throw data("Unauthorized", {
            status: 401,
        });
    }

    const publicUser = mapPublicUser(user);

    return {
        publicUser,
    };
}

export function HydrateFallback() {
    return (
        <>
            <noscript>
                <Text>
                    JavaScript is <Strong color="red.solid">required</Strong> to
                    use the admin panel.
                </Text>
            </noscript>

            <Text>Loading...</Text>
        </>
    );
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
                        <ArticleMultipleIcon />
                    </Sidebar.Icon>
                    News
                </Sidebar.Link>

                <Sidebar.Link to={`/admin/events`} comparator="startsWith">
                    <Sidebar.Icon>
                        <CalendarMultipleIcon />
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
