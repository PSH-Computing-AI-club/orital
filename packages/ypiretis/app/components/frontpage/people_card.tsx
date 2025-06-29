import {Avatar, Card, Image, Text} from "@chakra-ui/react";

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
        <Card.Description color="fg.subtle" zIndex="2">
            <FrontpageShell.MailToLink to={email}>
                {email}
            </FrontpageShell.MailToLink>
        </Card.Description>
    );
}

function PeopleCardTitle(props: IPeopleCardTitleProps) {
    const {children} = props;

    return <Card.Title zIndex="2">{children}</Card.Title>;
}

function PeopleCardAvatar(props: IPeopleCardAvatarProps) {
    const {name, src} = props;

    return (
        <Avatar.Root
            blockSize="32"
            inlineSize="32"
            marginBlockEnd="4"
            zIndex="1"
        >
            <Image
                src="/images/avatar.halo.webp"
                position="absolute"
                blockSize="48"
                inlineSize="48"
                maxWidth="unset"
                zIndex="1"
            />
            <Avatar.Image src={src} zIndex="2" />
            <Avatar.Fallback name={name} zIndex="2" />
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
