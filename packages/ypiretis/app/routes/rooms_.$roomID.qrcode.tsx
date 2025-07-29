import {Flex, Heading, Highlight, QrCode, Strong, Text} from "@chakra-ui/react";

import type {ShouldRevalidateFunction} from "react-router";

import * as v from "valibot";

import {
    DISPLAY_ENTITY_STATES,
    requireAuthenticatedDisplayConnection,
} from "~/.server/services/rooms_service";

import {ulid} from "~/.server/utils/valibot";

import Links from "~/components/common/links";

import {validateParams} from "~/guards/validation";

import {WebSocketCacheProvider} from "~/hooks/web_socket";

import type {IDisplayContext} from "~/state/display";
import {DisplayContextProvider, useDisplayContext} from "~/state/display";

import {APP_NAME} from "~/utils/constants";
import {buildAppURL} from "~/utils/url";

import {Route} from "./+types/rooms_.$roomID.qrcode";

const LOADER_PARAMS_SCHEMA = v.object({
    roomID: ulid,
});

export const shouldRevalidate = ((_revalidateArgs) => {
    return false;
}) satisfies ShouldRevalidateFunction;

export function clientLoader(loaderArgs: Route.ClientLoaderArgs) {
    return loaderArgs.serverLoader();
}

clientLoader.hydrate = true as const;

export async function loader(loaderArgs: Route.LoaderArgs) {
    const {roomID} = validateParams(LOADER_PARAMS_SCHEMA, loaderArgs);

    const {room} = await requireAuthenticatedDisplayConnection(
        loaderArgs,
        roomID,
    );

    const {pin, state, title} = room;

    return {
        initialContextData: {
            room: {
                pin,
                roomID,
                state,
                title,
            },

            state: DISPLAY_ENTITY_STATES.disposed,
        } satisfies IDisplayContext,
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
    const {room} = useDisplayContext();
    const {pin, title} = room;

    const joinURL = buildAppURL(`/r/${pin}`).toString();

    return (
        <>
            <title>{`Join ${title} :: ${APP_NAME}`}</title>

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
                        value={joinURL}
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

                <Text fontFamily="mono" fontSize="2xl" fontWeight="bold">
                    <Links.InternalLink variant="prose" to={joinURL} isNewTab>
                        {joinURL}
                    </Links.InternalLink>
                </Text>
            </Flex>
        </>
    );
}

export default function RoomsQRCode(props: Route.ComponentProps) {
    const {loaderData} = props;
    const {initialContextData} = loaderData;

    return (
        <WebSocketCacheProvider>
            <DisplayContextProvider initialContextData={initialContextData}>
                <QRCodeView />
            </DisplayContextProvider>
        </WebSocketCacheProvider>
    );
}
