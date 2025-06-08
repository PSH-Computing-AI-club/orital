import type {IconProps} from "@chakra-ui/react";
import {Icon} from "@chakra-ui/react";

export type IIconProps = Omit<IIconRootProps, "children">;

export type IIconRootProps = Omit<IconProps, "as" | "asChild">;

export default function IconRoot(props: IIconRootProps) {
    const {
        children,
        fill = "currentcolor",
        size = "md",
        viewBox = "0 0 24 24",
        ...rest
    } = props;

    return (
        <Icon as="svg" viewBox={viewBox} fill={fill} size={size} {...rest}>
            {children}
        </Icon>
    );
}
