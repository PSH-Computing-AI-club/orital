import type {IconProps} from "@chakra-ui/react";
import {Icon} from "@chakra-ui/react";

import type {ReactNode} from "react";

export type IIconRootProps = Omit<
    IconProps,
    "as" | "asChild" | "children" | "viewBox"
>;

export interface IMakeIconComponentOptions {
    readonly icon: ReactNode;
}

export function makeIconComponent(options: IMakeIconComponentOptions) {
    const {icon} = options;

    return (props: IIconRootProps) => {
        return (
            <Icon
                as="svg"
                viewBox="0 0 24 24"
                fill="currentcolor"
                height="1.25em"
                width="1.25em"
                {...props}
            >
                {icon}
            </Icon>
        );
    };
}
