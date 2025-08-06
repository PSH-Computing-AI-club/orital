import type {
    GroupProps,
    IconProps,
    SpanProps,
    StackProps,
    TagRootProps,
} from "@chakra-ui/react";
import {Group, HStack, Icon, VStack, Span, Tag} from "@chakra-ui/react";

export interface IListTileFooterProps extends GroupProps {}

export interface IListTileSubTitleProps extends SpanProps {}

export interface IListTileTagProps extends TagRootProps {}

export interface IListTileTitleProps extends StackProps {}

export interface IListTileHeaderProps extends StackProps {}

export interface IListTileIconProps extends Omit<IconProps, "asChild"> {}

export interface IListTileRootProps extends StackProps {}

function ListTileFooter(props: IListTileFooterProps) {
    const {children, ...rest} = props;

    return (
        <Group marginInlineStart="auto" {...rest}>
            {children}
        </Group>
    );
}

function ListTileSubTitle(props: IListTileSubTitleProps) {
    const {children, ...rest} = props;

    return (
        <Span color="fg.muted" {...rest}>
            {children}
        </Span>
    );
}

function ListTileTag(props: IListTileTagProps) {
    const {children, ...rest} = props;

    return (
        <Tag.Root variant="solid" size="sm" {...rest}>
            <Tag.Label>{children}</Tag.Label>
        </Tag.Root>
    );
}

function ListTileTitle(props: IListTileTitleProps) {
    const {children, ...rest} = props;

    return <HStack {...rest}>{children}</HStack>;
}

function ListTileHeader(props: IListTileHeaderProps) {
    const {children, ...rest} = props;

    return (
        <VStack gap="0" alignItems="flex-start" lineHeight="shorter" {...rest}>
            {children}
        </VStack>
    );
}

function ListTileIcon(props: IListTileIconProps) {
    const {children, ...rest} = props;

    return (
        <Icon fontSize="2xl" {...rest}>
            {children}
        </Icon>
    );
}

function ListTileRoot(props: IListTileRootProps) {
    const {children, ...rest} = props;

    return (
        <HStack
            gap="2"
            bg="bg"
            padding="3"
            borderColor="border"
            borderStyle="solid"
            borderWidth="thin"
            fontSize="xs"
            {...rest}
        >
            {children}
        </HStack>
    );
}

const ListTile = {
    Footer: ListTileFooter,
    Header: ListTileHeader,
    Icon: ListTileIcon,
    Root: ListTileRoot,
    SubTitle: ListTileSubTitle,
    Tag: ListTileTag,
    Title: ListTileTitle,
} as const;

export default ListTile;
