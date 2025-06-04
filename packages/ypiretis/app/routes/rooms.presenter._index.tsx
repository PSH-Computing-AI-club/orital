import {Strong, Text} from "@chakra-ui/react";

import {useEffect} from "react";

import {requireAuthenticatedSession} from "~/.server/services/users_service";

import useEventSource from "~/hooks/event_source";

import {Route} from "./+types/rooms.presenter._index";

export async function loader(loaderArgs: Route.LoaderArgs) {
    const {request} = loaderArgs;

    await requireAuthenticatedSession(request);
}

export function HydrateFallback() {
    return (
        <>
            <noscript>
                <Text>
                    JavaScript is <Strong color="red.solid">required</Strong> to
                    use the presenter portal.
                </Text>
            </noscript>

            <Text>Loading...</Text>
        </>
    );
}

export default function RoomsPresenter() {
    const message = useEventSource("/rooms/presenter/events", {
        init: {
            async onopen(response) {
                if (!response.ok) {
                    // **TODO:** do something here
                }
            },
        },
    });

    useEffect(() => {
        if (!message) {
            return;
        }

        console.log({message});
    }, [message]);

    return <>Stuff will happun here!</>;
}
