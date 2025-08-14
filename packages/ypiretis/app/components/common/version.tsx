import {
    APP_REPOSITORY_URL,
    PACKAGE_NAME,
    PACKAGE_VERSION,
} from "~/utils/constants";

import type {ILinksExternalLinkProps} from "./links";
import Links from "./links";

export interface IVersionLinkProps
    extends Omit<ILinksExternalLinkProps, "asChild" | "children" | "to"> {}

function VersionLink(props: IVersionLinkProps) {
    return (
        <Links.ExternalLink to={APP_REPOSITORY_URL} {...props}>
            <VersionText />
        </Links.ExternalLink>
    );
}

function VersionText() {
    return `${PACKAGE_NAME} v${PACKAGE_VERSION}`;
}

const Version = {
    Link: VersionLink,
    Text: VersionText,
} as const;

export default Version;
