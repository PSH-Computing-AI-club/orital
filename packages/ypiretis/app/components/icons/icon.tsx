import type {IconProps} from "@chakra-ui/react";
import {Icon} from "@chakra-ui/react";

export type IIconProps = Omit<IIconRootProps, "children">;

export type IIconRootProps = Omit<IconProps, "as" | "asChild">;

export default function IconRoot(props: IIconRootProps) {
    const {
        children,
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
            {children}
        </Icon>
    );
}
