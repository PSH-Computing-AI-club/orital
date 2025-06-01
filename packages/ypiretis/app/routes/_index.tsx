import {wrapMetaFunction} from "~/utils/meta";

import type {Route} from "./+types/_index";

export const meta = wrapMetaFunction(() => {
    return [{title: "New React Router App"}];
});

export default function Index(props: Route.ComponentProps) {
    return <h1>Hello world!</h1>;
}
