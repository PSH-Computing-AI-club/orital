import {LinkBox, LinkOverlay, Span} from "@chakra-ui/react";

import type {PropsWithChildren} from "react";

import type {To} from "react-router";

import Links from "~/components/common/links";

export interface IActionCardLinkProps extends PropsWithChildren {
    readonly to: To;
}

export interface IActionCardIconProps extends PropsWithChildren {}

export interface IActionCardRootProps extends PropsWithChildren {}

function ActionCardLink(props: IActionCardLinkProps) {
    const {children, to} = props;

    return (
        <LinkOverlay asChild>
            <Links.InternalLink to={to}>{children}</Links.InternalLink>
        </LinkOverlay>
    );
}

function ActionCardIcon(props: IActionCardIconProps) {
    const {children} = props;

    return <Span fontSize="3xl">{children}</Span>;
}

function ActionCardRoot(props: IActionCardRootProps) {
    const {children} = props;

    return (
        <LinkBox
            display="flex"
            flexDirection="column"
            gap="4"
            alignItems="center"
            justifyContent="center"
            fontSize="lg"
            _hover={{color: "cyan.solid"}}
        >
            {children}
        </LinkBox>
    );
}

const ActionCard = {
    Link: ActionCardLink,
    Icon: ActionCardIcon,
    Root: ActionCardRoot,
} as const;

export default ActionCard;
