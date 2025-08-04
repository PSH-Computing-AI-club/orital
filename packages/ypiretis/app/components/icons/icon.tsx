import type {IconProps} from "@chakra-ui/react";
import {Icon} from "@chakra-ui/react";

import type {ReactNode} from "react";

export type IIconRootProps = Omit<IconProps, "as" | "asChild" | "children">;

export interface IMakeIconComponentOptions {
    readonly icon: ReactNode;
}

export function makeIconComponent(options: IMakeIconComponentOptions) {
    const {icon} = options;

    return (props: IIconRootProps) => {
        const {
            fill = "currentcolor",
            height = "1.25em",
            viewBox = "0 0 24 24",
            width = "1.25em",
            ...rest
        } = props;

        return (
            <Icon
                as="svg"
                viewBox={viewBox}
                fill={fill}
                height={height}
                width={width}
                {...rest}
            >
                {icon}
            </Icon>
        );
    };
}
