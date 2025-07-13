import {Box, Container, Heading} from "@chakra-ui/react";

import type {PropsWithChildren} from "react";

export interface IContentTitleProps extends PropsWithChildren {}

export interface IContentContainerProps extends PropsWithChildren {}

export interface IContentRootProps extends PropsWithChildren {}

function ContentTitle(props: IContentTitleProps) {
    const {children} = props;

    return (
        <Heading marginBlockEnd="4" fontSize={{base: "4xl", lgDown: "3xl"}}>
            {children}
        </Heading>
    );
}

function ContentContainer(props: IContentContainerProps) {
    const {children} = props;

    return (
        <Container display="flex" flexDirection="column">
            {children}
        </Container>
    );
}

function ContentRoot(props: IContentRootProps) {
    const {children} = props;

    return (
        <Box
            as="section"
            flexGrow="1"
            bg="bg.muted"
            color="fg"
            paddingBlock="8"
        >
            {children}
        </Box>
    );
}

const Content = {
    Container: ContentContainer,
    Root: ContentRoot,
    Title: ContentTitle,
} as const;

export default Content;
