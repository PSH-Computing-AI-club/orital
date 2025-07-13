import {Flex} from "@chakra-ui/react";

import {Outlet} from "react-router";

import {
    getOptionalSession,
    mapPublicUser,
} from "~/.server/services/users_service";

import FrontpageFooter from "~/components/frontpage/frontpage_footer";
import FrontpageNavbar from "~/components/frontpage/frontpage_navbar";

import {PublicUserContextProvider} from "~/state/public_user";

import {Route} from "./+types/_frontpage_";

export async function loader(loaderArgs: Route.LoaderArgs) {
    const {request} = loaderArgs;

    const session = await getOptionalSession(request);

    if (!session) {
        return;
    }

    const publicUser = mapPublicUser(session.identifiable);

    return {
        publicUser,
    };
}

export default function FrontpageLayout(props: Route.ComponentProps) {
    const {loaderData} = props;
    const publicUser = loaderData?.publicUser;

    return publicUser ? (
        <PublicUserContextProvider publicUser={publicUser}>
            <FrontpageNavbar />

            <Flex as="main" flexDirection="column" flexGrow="1">
                <Outlet />
            </Flex>

            <FrontpageFooter />
        </PublicUserContextProvider>
    ) : (
        <>
            <FrontpageNavbar />

            <Flex as="main" flexDirection="column" flexGrow="1">
                <Outlet />
            </Flex>

            <FrontpageFooter />
        </>
    );
}
