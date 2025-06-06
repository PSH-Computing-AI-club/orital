import {Strong, Text} from "@chakra-ui/react";

import {useEffect} from "react";

import {requireAuthenticatedSession} from "~/.server/services/users_service";

import useEventSource from "~/hooks/event_source";

import {Route} from "./+types/rooms.$pin.presenter._index";

export async function loader(loaderArgs: Route.LoaderArgs) {
    const {params, request} = loaderArgs;

    await requireAuthenticatedSession(request);

    const {pin} = params;

    return {
        pin,
    };
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

export default function RoomsPresenter(props: Route.ComponentProps) {
    const {loaderData} = props;
    const {pin} = loaderData;

    const message = useEventSource(`/rooms/${pin}/presenter/events`, {
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
