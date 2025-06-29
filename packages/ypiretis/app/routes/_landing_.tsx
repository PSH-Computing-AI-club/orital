import {Outlet} from "react-router";

import FrontpageFooter from "~/components/frontpage/frontpage_footer";
import FrontpageNavbar from "~/components/frontpage/frontpage_navbar";

export default function LandingLayout() {
    return (
        <>
            <FrontpageNavbar />
            <Outlet />
            <FrontpageFooter />
        </>
    );
}
