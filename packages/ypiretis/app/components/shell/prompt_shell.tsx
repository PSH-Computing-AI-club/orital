// **HACK:** *cough* *cough* don't think about it...
import type {ColorsToken} from "../../../../../node_modules/@chakra-ui/react/dist/types/styled-system/generated/token.gen";

import {
    Card,
    Flex,
    Heading,
    Highlight,
    Image,
    Text,
    VStack,
} from "@chakra-ui/react";

import {APP_NAME, PACKAGE_NAME, PACKAGE_VERSION} from "~/utils/constants";

import type {PropsWithChildren} from "react";

export interface IPromptShellTitle {
    readonly color?: ColorsToken;

    readonly query?: string;

    readonly title: string;
}

export interface IPromptShellBodyProps extends PropsWithChildren {}

export interface IPromptShellContainerProps extends PropsWithChildren {}

export interface IPromptShellSidebarProps {}

export interface IPromptShellRootProps extends PropsWithChildren {}

function PromptShellTitle(props: IPromptShellTitle) {
    const {color = "cyan.solid", query, title} = props;

    return (
        <>
            <title>{`${title} :: ${APP_NAME}`}</title>

            <Heading
                size="4xl"
                marginBlockStart={{lgDown: "auto"}}
                maxInlineSize={{smDown: "min"}}
                textAlign={{smDown: "center"}}
            >
                {query ? (
                    <Highlight query={query} styles={{color}}>
                        {title}
                    </Highlight>
                ) : (
                    <>{title}</>
                )}
            </Heading>
        </>
    );
}

function PromptShellBody(props: IPromptShellBodyProps) {
    const {children} = props;

    return (
        <Flex justifyContent="center" alignSelf="stretch">
            <Card.Root size="lg" flexGrow="1" maxInlineSize="prose">
                <Card.Body gap="4">{children}</Card.Body>
            </Card.Root>
        </Flex>
    );
}

function PromptShellContainer(props: IPromptShellContainerProps) {
    const {children} = props;

    return (
        <VStack
            gap="16"
            align="center"
            justify="center"
            flexGrow="1"
            padding={{lgTo2xl: "10", mdOnly: "5"}}
            width="full"
            background={{
                //lgDown: "color-mix(in srgb, var(--chakra-colors-bg-inverted), transparent 95%)",
                lgDown: "rgba(9, 9, 11, 0.15)",
            }}
        >
            {children}

            <Text
                hideFrom="lg"
                marginBlockStart="auto"
                marginBlockEnd={{lgTo2xl: "-10", mdOnly: "-5"}}
            >
                {PACKAGE_NAME} v{PACKAGE_VERSION}
            </Text>
        </VStack>
    );
}

function PromptShellSidebar(_props: IPromptShellSidebarProps) {
    return (
        <VStack
            justify="center"
            bg="bg.inverted"
            color="fg.inverted"
            hideBelow="lg"
            padding="10"
            maxInlineSize="96"
            minInlineSize="96"
        >
            <Image
                src="/images/logo.prompt.webp"
                marginBlockStart="auto"
                pointerEvents="none"
            />

            <Text marginBlockStart="auto" marginBlockEnd="-10">
                {PACKAGE_NAME} v{PACKAGE_VERSION}
            </Text>
        </VStack>
    );
}

function PromptShellRoot(props: IPromptShellRootProps) {
    const {children} = props;

    return (
        <>
            <Image
                src="/images/logo.prompt.webp"
                hideFrom="lg"
                position="fixed"
                left="0"
                bottom="0"
                transform={{
                    base: "scale(2)",
                    mdDown: "scale(1.5)",
                    smDown: "scale(1.25)",
                }}
                pointerEvents="none"
                opacity="0.10"
                mixBlendMode="plus-lighter"
                blur="2px"
                filter="auto"
                zIndex="-1"
            />

            <Flex align="stretch" width="dvw" height="dvh">
                {children}
            </Flex>
        </>
    );
}

const PromptShell = {
    Body: PromptShellBody,
    Container: PromptShellContainer,
    Sidebar: PromptShellSidebar,
    Root: PromptShellRoot,
    Title: PromptShellTitle,
};

export default PromptShell;
