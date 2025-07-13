import {Link} from "@chakra-ui/react";

import type {PropsWithChildren} from "react";

import type {To} from "react-router";
import {Link as RouterLink} from "react-router";

export const LINK_VARIANTS = {
    inline: "inline",

    interface: "interface",
} as const;

export type ILinkVariants = (typeof LINK_VARIANTS)[keyof typeof LINK_VARIANTS];

export interface ILinksLinkProp extends PropsWithChildren {
    readonly variant?: ILinkVariants;
}

export interface ILinksExternalLinkProps extends ILinksLinkProp {
    readonly to: string;
}

export interface ILinksInternalLinkProps extends ILinksLinkProp {
    readonly isNewTab?: boolean;

    readonly to: To;
}

export interface ILinksMailToLinkProps extends ILinksLinkProp {
    readonly to: string;
}

function getLinkVariantStyle(variant: ILinkVariants) {
    switch (variant) {
        case LINK_VARIANTS.inline:
            return InlineVariantLink;

        case LINK_VARIANTS.interface:
            return InterfaceVariantLink;
    }
}

function InlineVariantLink(props: PropsWithChildren) {
    const {children} = props;

    return (
        <Link
            variant="underline"
            color="blue.solid"
            _hover={{color: "blue.emphasized"}}
            asChild
        >
            {children}
        </Link>
    );
}

function InterfaceVariantLink(props: PropsWithChildren) {
    const {children} = props;

    return (
        <Link
            color="currentcolor"
            _hover={{color: "cyan.solid", textDecoration: "underline"}}
            asChild
        >
            {children}
        </Link>
    );
}

function LinksExternalLink(props: ILinksExternalLinkProps) {
    const {children, to, variant = LINK_VARIANTS.interface} = props;

    const Variant = getLinkVariantStyle(variant);

    return (
        <Variant>
            <Link href={to} target="_blank" rel="noopener noreferrer">
                {children}
            </Link>
        </Variant>
    );
}

function LinksMailToLink(props: ILinksMailToLinkProps) {
    const {children, to, variant = LINK_VARIANTS.interface} = props;

    const Variant = getLinkVariantStyle(variant);

    return (
        <Variant>
            <Link href={`mailto:${to}`}>{children}</Link>
        </Variant>
    );
}

function LinksInternalLink(props: ILinksInternalLinkProps) {
    const {
        children,
        isNewTab = false,
        to,
        variant = LINK_VARIANTS.interface,
    } = props;

    const Variant = getLinkVariantStyle(variant);

    return (
        <Variant>
            <Link asChild>
                <RouterLink to={to} target={isNewTab ? "_blank" : undefined}>
                    {children}
                </RouterLink>
            </Link>
        </Variant>
    );
}

const Links = {
    ExternalLink: LinksExternalLink,
    InternalLink: LinksInternalLink,
    MailToLink: LinksMailToLink,
} as const;

export default Links;
