import {
    Card,
    Container,
    Flex,
    Heading,
    Highlight,
    Link,
    QrCode,
    Text,
} from "@chakra-ui/react";

import {data} from "react-router";

import * as v from "valibot";

import {requireAuthenticatedPresenterSession} from "~/.server/services/room_service";

import {buildAppURL} from "~/utils/url";

import {Route} from "./+types/rooms.$roomID.qrcode";

const ACTION_PARAMS_SCHEMA = v.object({
    roomID: v.pipe(v.string(), v.ulid()),
});

export async function loader(loaderArgs: Route.LoaderArgs) {
    const {params, request} = loaderArgs;

    const {output: paramsData, success: isValidParams} = v.safeParse(
        ACTION_PARAMS_SCHEMA,
        params,
    );

    if (!isValidParams) {
        throw data("Bad Request", 400);
    }

    const {room} = await requireAuthenticatedPresenterSession(
        request,
        paramsData.roomID,
    );

    const {roomID, pin, title} = room;

    return {
        pin,
        roomID,
        title,
    };
}

export default function RoomsQRCode(props: Route.ComponentProps) {
    const {loaderData} = props;
    const {pin, roomID, title} = loaderData;

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
                <Link variant="underline" href={joinURL} colorPalette="blue">
                    {joinURL}
                </Link>
            </Text>
        </Flex>
    );
}
