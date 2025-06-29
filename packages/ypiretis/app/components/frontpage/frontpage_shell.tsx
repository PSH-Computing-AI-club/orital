import {Link} from "@chakra-ui/react";

import type {PropsWithChildren} from "react";

import type {To} from "react-router";
import {Link as RouterLink} from "react-router";

export interface IExternalLinkProps extends PropsWithChildren {
    readonly to: string;
}

export interface IInternalLinkProps extends PropsWithChildren {
    readonly isNewTab?: boolean;

    readonly to: To;
}

function ExternalLink(props: IExternalLinkProps) {
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

function InternalLink(props: IInternalLinkProps) {
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
    ExternalLink,
    InternalLink,
} as const;

export default FrontpageShell;
