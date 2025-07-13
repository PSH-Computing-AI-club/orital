// **HACK:** *cough* *cough* don't think about it...
import type {ColorsToken} from "../../../../../node_modules/@chakra-ui/react/dist/types/styled-system/generated/token.gen";

import {
    Bleed,
    Box,
    Card,
    Flex,
    Heading,
    Highlight,
    Image,
    Spacer,
    Text,
    VStack,
} from "@chakra-ui/react";

import Title from "~/components/common/title";
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
            <Title title={title} />

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
        >
            <Spacer />

            {children}

            <Spacer />

            <Text hideFrom="lg" marginBlockEnd={{lgTo2xl: "-10", mdOnly: "-5"}}>
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
            backgroundImage="url('/images/border.vertical.webp')"
            backgroundSize="96px"
            backgroundPosition="right"
            backgroundRepeat="repeat-y"
            color="fg.inverted"
            hideBelow="lg"
            padding="10"
            maxInlineSize="96"
            minInlineSize="96"
        >
            <Spacer />

            <Image
                src="/images/logo.gradient.webp"
                blockSize="sm"
                inlineSize="sm"
                pointerEvents="none"
            />

            <Spacer />

            <Bleed blockEnd="10" asChild>
                <Text>
                    {PACKAGE_NAME} v{PACKAGE_VERSION}
                </Text>
            </Bleed>
        </VStack>
    );
}

function PromptShellRoot(props: IPromptShellRootProps) {
    const {children} = props;

    return (
        <>
            <Image
                src="/images/logo.monochrome.light.webp"
                hideFrom="lg"
                position="fixed"
                left={{base: "24", smDown: "0"}}
                bottom="24"
                transform={{base: "scale(2)", smDown: "scale(1.5)"}}
                opacity="0.1"
                pointerEvents="none"
                zIndex="-1"
            />

            <Box position="fixed" inset="0" zIndex="-1" />

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
