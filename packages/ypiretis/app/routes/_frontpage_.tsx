import {Flex} from "@chakra-ui/react";

import {Outlet} from "react-router";

import {getOptionalSession} from "~/.server/services/users_service";

import Footer from "~/components/frontpage/footer";
import Navbar from "~/components/frontpage/navbar";

import {PublicUserContextProvider, mapPublicUser} from "~/state/public_user";

import {Route} from "./+types/_frontpage_";

export async function loader(loaderArgs: Route.LoaderArgs) {
    const session = await getOptionalSession(loaderArgs);

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
            <Navbar />

            <Flex as="main" flexDirection="column" flexGrow="1">
                <Outlet />
            </Flex>

            <Footer />
        </PublicUserContextProvider>
    ) : (
        <>
            <Navbar />

            <Flex as="main" flexDirection="column" flexGrow="1">
                <Outlet />
            </Flex>

            <Footer />
        </>
    );
}
