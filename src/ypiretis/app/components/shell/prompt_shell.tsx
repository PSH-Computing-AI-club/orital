import type {SystemProperties} from "node_modules/@chakra-ui/react/dist/types/styled-system/generated/system.gen";

import {
    Card,
    Flex,
    Heading,
    Highlight,
    Image,
    Text,
    VStack,
} from "@chakra-ui/react";

import {PACKAGE_NAME, PACKAGE_VERSION} from "~/utils/constants";

import type {PropsWithChildren} from "react";

export type IPromptShellProps = PropsWithChildren<{
    readonly color?: SystemProperties["color"];

    readonly query?: string;

    readonly title: string;
}>;

export default function PromptShell(props: IPromptShellProps) {
    const {children, color = "cyan.solid", query, title} = props;

    // **TODO:** Fix reponsive layout for mobile / tablet.

    return (
        <Flex
            direction={{base: "row", mdDown: "column"}}
            align="stretch"
            width="dvw"
            height="dvh"
        >
            <VStack
                justify="center"
                bg="bg.inverted"
                color="fg.inverted"
                padding="10"
                maxInlineSize="96"
                minInlineSize="96"
            >
                <Image src="/images/logo.prompt.png" marginBlockStart="auto" />

                <Text marginBlockStart="auto" marginBlockEnd="-10">
                    {PACKAGE_NAME} v{PACKAGE_VERSION}
                </Text>
            </VStack>

            <VStack
                gap="16"
                align="center"
                justify="center"
                padding="10"
                width="full"
            >
                <Heading size="4xl">
                    {query ? (
                        <Highlight query={query} styles={{color}}>
                            {title}
                        </Highlight>
                    ) : (
                        <>{title}</>
                    )}
                </Heading>

                <Flex justifyContent="center" alignSelf="stretch">
                    <Card.Root size="lg" flexGrow="1" maxInlineSize="prose">
                        <Card.Body gap="4">{children}</Card.Body>
                    </Card.Root>
                </Flex>
            </VStack>
        </Flex>
    );
}
