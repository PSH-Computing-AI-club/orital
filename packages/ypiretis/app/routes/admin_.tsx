import {Spacer, Strong, Text} from "@chakra-ui/react";

import {Outlet} from "react-router";

import {requireAuthenticatedAdminSession} from "~/.server/services/users_service";

import Separator from "~/components/common/separator";
import Toasts from "~/components/controlpanel/toasts";

import Layout from "~/components/controlpanel/layout";
import Sidebar from "~/components/controlpanel/sidebar";

import ArticleMultipleIcon from "~/components/icons/article_multiple_icon";
import CalendarMultipleIcon from "~/components/icons/calendar_multiple_icon";
import DashboardIcon from "~/components/icons/dashboard_icon";
import HomeIcon from "~/components/icons/home_icon";

import {PublicUserContextProvider, mapPublicUser} from "~/state/public_user";

import {Route} from "./+types/admin_";

export function clientLoader(loaderArgs: Route.ClientLoaderArgs) {
    return loaderArgs.serverLoader();
}

clientLoader.hydrate = true as const;

export async function loader(loaderArgs: Route.LoaderArgs) {
    const {identifiable: user} =
        await requireAuthenticatedAdminSession(loaderArgs);

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
                    Home
                </Sidebar.Link>
            </Sidebar.Container>
        </Sidebar.Root>
    );
}

export default function AdminLayout(props: Route.ComponentProps) {
    const {loaderData} = props;
    const {publicUser} = loaderData;

    return (
        <Toasts.Root>
            <Layout.Root>
                <PublicUserContextProvider publicUser={publicUser}>
                    <SidebarView />

                    <Outlet />
                </PublicUserContextProvider>
            </Layout.Root>

            <Toasts.Container />
        </Toasts.Root>
    );
}
