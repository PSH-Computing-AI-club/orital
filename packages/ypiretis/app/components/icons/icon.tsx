import type {IconProps} from "@chakra-ui/react";
import {Icon} from "@chakra-ui/react";

export type IIconProps = Omit<IIconRootProps, "children">;

export type IIconRootProps = Omit<IconProps, "as" | "asChild">;

export default function IconRoot(props: IIconRootProps) {
    const {children, fill = "currentcolor", size = "md", ...rest} = props;

    return (
        <Icon as="svg" fill={fill} size={size} {...rest}>
            {children}
        </Icon>
    );
}
