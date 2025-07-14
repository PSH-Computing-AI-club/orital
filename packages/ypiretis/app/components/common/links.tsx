import type {LinkProps} from "@chakra-ui/react";
import {Link} from "@chakra-ui/react";

import type {PropsWithChildren} from "react";

import type {To} from "react-router";
import {Link as RouterLink} from "react-router";

export const LINK_VARIANTS = {
    prose: "prose",

    interface: "interface",
} as const;

export type ILinkVariants = (typeof LINK_VARIANTS)[keyof typeof LINK_VARIANTS];

export interface ILinksLinkProps extends Omit<LinkProps, "to" | "variant"> {
    readonly variant?: ILinkVariants;
}

export interface ILinksExternalLinkProps extends ILinksLinkProps {
    readonly to: string;
}

export interface ILinksInternalLinkProps extends ILinksLinkProps {
    readonly isNewTab?: boolean;

    readonly to: To;
}

export interface ILinksMailToLinkProps extends ILinksLinkProps {
    readonly to: string;
}

function getLinkVariantStyle(variant: ILinkVariants) {
    switch (variant) {
        case LINK_VARIANTS.prose:
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
    const {children, to, variant = LINK_VARIANTS.interface, ...rest} = props;

    const Variant = getLinkVariantStyle(variant);

    return (
        <Variant>
            <Link href={to} target="_blank" rel="noopener noreferrer" {...rest}>
                {children}
            </Link>
        </Variant>
    );
}

function LinksMailToLink(props: ILinksMailToLinkProps) {
    const {children, to, variant = LINK_VARIANTS.interface, ...rest} = props;

    const Variant = getLinkVariantStyle(variant);

    return (
        <Variant>
            <Link href={`mailto:${to}`} {...rest}>
                {children}
            </Link>
        </Variant>
    );
}

function LinksInternalLink(props: ILinksInternalLinkProps) {
    const {
        children,
        isNewTab = false,
        to,
        variant = LINK_VARIANTS.interface,
        ...rest
    } = props;

    const Variant = getLinkVariantStyle(variant);

    return (
        <Variant>
            <Link asChild {...rest}>
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
