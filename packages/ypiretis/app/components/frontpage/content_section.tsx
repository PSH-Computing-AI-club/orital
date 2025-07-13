import {Box, Container, Heading} from "@chakra-ui/react";

import type {PropsWithChildren} from "react";

export interface IContentSectionTitleProps extends PropsWithChildren {}

export interface IContentSectionContainerProps extends PropsWithChildren {}

export interface IContentSectionRootProps extends PropsWithChildren {}

function ContentSectionTitle(props: IContentSectionTitleProps) {
    const {children} = props;

    return (
        <Heading marginBlockEnd="8" fontSize={{base: "4xl", lgDown: "3xl"}}>
            {children}
        </Heading>
    );
}

function ContentSectionContainer(props: IContentSectionContainerProps) {
    const {children} = props;

    return (
        <Container display="flex" flexDirection="column">
            {children}
        </Container>
    );
}

function ContentSectionRoot(props: IContentSectionRootProps) {
    const {children} = props;

    return (
        <Box
            as="section"
            flexGrow="1"
            bg="bg.muted"
            color="fg"
            paddingBlock="16"
        >
            {children}
        </Box>
    );
}

const ContentSection = {
    Container: ContentSectionContainer,
    Root: ContentSectionRoot,
    Title: ContentSectionTitle,
} as const;

export default ContentSection;
