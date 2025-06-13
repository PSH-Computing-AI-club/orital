import {
    Flex,
    Heading,
    Highlight,
    Link,
    QrCode,
    Strong,
    Text,
} from "@chakra-ui/react";

import type {ShouldRevalidateFunction} from "react-router";
import {data} from "react-router";

import * as v from "valibot";

import {requireAuthenticatedDisplayConnection} from "~/.server/services/room_service";

import {WebSocketCacheProvider} from "~/hooks/web_socket";

import type {IRoom} from "~/state/display";
import {DisplayContextProvider, useDisplayContext} from "~/state/display";

import {buildAppURL} from "~/utils/url";

import {Route} from "./+types/rooms.$roomID.qrcode";

const LOADER_PARAMS_SCHEMA = v.object({
    roomID: v.pipe(v.string(), v.ulid()),
});

export const shouldRevalidate = ((_revalidateArgs) => {
    return false;
}) satisfies ShouldRevalidateFunction;

export function clientLoader(loaderArgs: Route.ClientLoaderArgs) {
    return loaderArgs.serverLoader();
}

clientLoader.hydrate = true as const;

export async function loader(loaderArgs: Route.LoaderArgs) {
    const {params, request} = loaderArgs;

    const {output, success} = v.safeParse(LOADER_PARAMS_SCHEMA, params);

    if (!success) {
        throw data("Bad Request", 400);
    }

    const {room} = await requireAuthenticatedDisplayConnection(
        request,
        output.roomID,
    );

    const {pin, roomID, state, title} = room;

    return {
        initialRoomData: {
            pin,
            roomID,
            state,
            title,
        } satisfies IRoom,
    };
}

export function HydrateFallback() {
    return (
        <>
            <noscript>
                <Text>
                    JavaScript is <Strong color="red.solid">required</Strong> to
                    display the QR Code.
                </Text>
            </noscript>

            <Text>Loading...</Text>
        </>
    );
}

function QRCodeView() {
    const {pin, roomID, title} = useDisplayContext();

    const roomURL = buildAppURL(`/attendee/${roomID}`).toString();
    const joinURL = buildAppURL(`/r/${pin}`).toString();

    return (
        <Flex
            direction="column"
            gap="16"
            justifyContent="center"
            alignItems="center"
            blockSize="dvh"
            inlineSize="dvw"
        >
            <Heading size="4xl">
                <Highlight query="Join" styles={{color: "cyan.solid"}}>
                    {`Join ${title}`}
                </Highlight>
            </Heading>

            <Flex justifyContent="center">
                <QrCode.Root
                    value={roomURL}
                    encoding={{ecc: "H"}}
                    bg="bg"
                    padding="6"
                >
                    <QrCode.Frame
                        blockSize="min(50dvw, 50dvh, var(--chakra-sizes-lg))"
                        inlineSize="min(50dvw, 50dvh, var(--chakra-sizes-lg))"
                    >
                        <QrCode.Pattern />
                    </QrCode.Frame>
                </QrCode.Root>
            </Flex>

            <Text fontWeight="bold" fontSize="2xl">
                <Link
                    variant="underline"
                    href={joinURL}
                    target="_blank"
                    colorPalette="blue"
                >
                    {joinURL}
                </Link>
            </Text>
        </Flex>
    );
}

export default function RoomsQRCode(props: Route.ComponentProps) {
    const {loaderData} = props;
    const {initialRoomData} = loaderData;

    return (
        <WebSocketCacheProvider>
            <DisplayContextProvider initialRoomData={initialRoomData}>
                <QRCodeView />
            </DisplayContextProvider>
        </WebSocketCacheProvider>
    );
}
