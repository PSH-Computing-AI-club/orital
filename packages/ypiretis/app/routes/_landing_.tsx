import {Outlet} from "react-router";

import {getOptionalSession} from "~/.server/services/users_service";

import FrontpageFooter from "~/components/frontpage/frontpage_footer";
import FrontpageNavbar from "~/components/frontpage/frontpage_navbar";

import type {ISession} from "~/state/session";
import {SessionContextProvider} from "~/state/session";

import {Route} from "./+types/_landing_";

export async function loader(loaderArgs: Route.LoaderArgs) {
    const {request} = loaderArgs;

    const session = await getOptionalSession(request);

    if (!session) {
        return;
    }

    const {accountID, firstName, lastName} = session.identifiable;

    return {
        session: {
            accountID,
            firstName,
            lastName,
        } satisfies ISession,
    };
}

export default function LandingLayout(props: Route.ComponentProps) {
    const {loaderData} = props;
    const session = loaderData?.session;

    return session ? (
        <SessionContextProvider session={session}>
            <FrontpageNavbar />
            <Outlet />
            <FrontpageFooter />
        </SessionContextProvider>
    ) : (
        <>
            <FrontpageNavbar />
            <Outlet />
            <FrontpageFooter />
        </>
    );
}
