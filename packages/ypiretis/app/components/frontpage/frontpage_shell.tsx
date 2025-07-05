import {Link} from "@chakra-ui/react";

import type {PropsWithChildren} from "react";

import type {To} from "react-router";
import {Link as RouterLink} from "react-router";

import {APP_NAME} from "~/utils/constants";

export interface IFrontpageShellTitleProps {
    readonly title?: string;
}

export interface IFrontpageShellExternalLinkProps extends PropsWithChildren {
    readonly to: string;
}

export interface IFrontpageShellInternalLinkProps extends PropsWithChildren {
    readonly isNewTab?: boolean;

    readonly to: To;
}

export interface IFrontpageShellMailToLinkProps extends PropsWithChildren {
    readonly to: string;
}

function FrontpageShellTitle(props: IFrontpageShellTitleProps) {
    const {title} = props;

    return title ? (
        <title>{`${title} :: ${APP_NAME}`}</title>
    ) : (
        <title>{APP_NAME}</title>
    );
}

function FrontpageShellExternalLink(props: IFrontpageShellExternalLinkProps) {
    const {children, to} = props;

    return (
        <Link
            color="currentcolor"
            _hover={{color: "cyan.solid"}}
            href={to}
            target="_blank"
            rel="noopener noreferrer"
        >
            {children}
        </Link>
    );
}

function FrontpageShellMailToLink(props: IFrontpageShellMailToLinkProps) {
    const {children, to} = props;

    return (
        <Link
            color="currentcolor"
            _hover={{color: "cyan.solid"}}
            href={`mailto:${to}`}
        >
            {children}
        </Link>
    );
}

function FrontpageShellInternalLink(props: IFrontpageShellInternalLinkProps) {
    const {children, isNewTab = false, to} = props;

    return (
        <Link color="currentcolor" _hover={{color: "cyan.solid"}} asChild>
            <RouterLink to={to} target={isNewTab ? "_blank" : undefined}>
                {children}
            </RouterLink>
        </Link>
    );
}

const FrontpageShell = {
    ExternalLink: FrontpageShellExternalLink,
    InternalLink: FrontpageShellInternalLink,
    MailToLink: FrontpageShellMailToLink,
    Title: FrontpageShellTitle,
} as const;

export default FrontpageShell;
