import {Avatar, Box, Card, Image, Text} from "@chakra-ui/react";

import type {PropsWithChildren} from "react";

import FrontpageShell from "./frontpage_shell";

export interface IPeopleCardTextProps extends PropsWithChildren {}

export interface IPeopleCardEmailProps {
    readonly email: string;
}

export interface IPeopleCardTitleProps extends PropsWithChildren {}

export interface IPeopleCardAvatarProps {
    readonly name: string;

    readonly src: string;
}

export interface IPeopleCardBodyProps extends PropsWithChildren {}

export interface IPeopleCardRootProps extends PropsWithChildren {}

function PeopleCardText(props: IPeopleCardTextProps) {
    const {children} = props;

    return <Text>{children}</Text>;
}

function PeopleCardEmail(props: IPeopleCardEmailProps) {
    const {email} = props;

    return (
        <Card.Description color="fg.subtle">
            <FrontpageShell.MailToLink to={email}>
                {email}
            </FrontpageShell.MailToLink>
        </Card.Description>
    );
}

function PeopleCardTitle(props: IPeopleCardTitleProps) {
    const {children} = props;

    return <Card.Title>{children}</Card.Title>;
}

function PeopleCardAvatar(props: IPeopleCardAvatarProps) {
    const {name, src} = props;

    return (
        <Avatar.Root
            bg="transparent"
            blockSize="32"
            inlineSize="32"
            marginBlockEnd="4"
            _before={{
                content: '""',

                position: "absolute",
                insetBlockStart: "-40px",
                insetInlineStart: "-40px",

                blockSize: "208px",
                inlineSize: "208px",

                bgImage: "url('/images/avatar.halo.webp')",
                bgSize: "208px",
                bgPos: "center",
                bgRepeat: "no-repeat",

                zIndex: -1,
            }}
            _after={{
                content: '""',

                position: "absolute",
                inset: "0",

                bg: "bg.muted",

                zIndex: -1,
            }}
        >
            <Avatar.Fallback name={name} />
            <Avatar.Image src={src} alt={`Avatar that represents ${name}.`} />
        </Avatar.Root>
    );
}

function PeopleCardBody(props: IPeopleCardBodyProps) {
    const {children} = props;

    return <Card.Body alignItems="center">{children}</Card.Body>;
}

function PeopleCardRoot(props: IPeopleCardRootProps) {
    const {children} = props;

    return (
        <Card.Root
            variant="subtle"
            bg="transparent"
            color="fg.inverted"
            textAlign="center"
            isolation="isolate"
        >
            {children}
        </Card.Root>
    );
}

const PeopleCard = {
    Avatar: PeopleCardAvatar,
    Body: PeopleCardBody,
    Email: PeopleCardEmail,
    Root: PeopleCardRoot,
    Text: PeopleCardText,
    Title: PeopleCardTitle,
} as const;

export default PeopleCard;
