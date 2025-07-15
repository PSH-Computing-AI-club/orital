import {Box, Container, Heading, Spacer, Text} from "@chakra-ui/react";

import type {PropsWithChildren} from "react";

import type {IPaginationProps} from "~/components/common/pagination";
import Pagination from "~/components/common/pagination";
import Prose from "~/components/common/prose";

export interface IContentSectionPaginationProps extends IPaginationProps {}

export interface IContentSectionProseProps {
    readonly dangerouslySetInnerHTML: {__html: string};
}

export interface IContentSectionDescriptionProps extends PropsWithChildren {}

export interface IContentSectionTitleProps extends PropsWithChildren {}

export interface IContentSectionContainerProps extends PropsWithChildren {}

export interface IContentSectionRootProps extends PropsWithChildren {}

function ContentSectionPagination(props: IPaginationProps) {
    return (
        <>
            <Spacer />
            <Pagination marginBlockStart="8" {...props} />
        </>
    );
}

function ContentSectionProse(props: IContentSectionProseProps) {
    const {dangerouslySetInnerHTML} = props;
    const {__html} = dangerouslySetInnerHTML;

    return (
        <Prose
            marginInline="auto"
            padding="6"
            bg="bg.panel"
            borderColor="border"
            borderStyle="solid"
            borderWidth="thin"
            fontSize={{base: "lg", lgDown: "md"}}
            dangerouslySetInnerHTML={{__html}}
            css={{
                "& > :first-child": {
                    marginBlockStart: 0,
                },
            }}
        />
    );
}

function ContentSectionDescription(props: IContentSectionDescriptionProps) {
    const {children} = props;

    return (
        <Text
            display="flex"
            alignItems="center"
            flexWrap="wrap"
            marginBlockStart="-4"
            marginBlockEnd="8"
            color="fg.muted"
            fontSize={{base: "lg", lgDown: "md"}}
        >
            {children}
        </Text>
    );
}

function ContentSectionTitle(props: IContentSectionTitleProps) {
    const {children} = props;

    return (
        <Heading
            as="h1"
            marginBlockEnd="8"
            fontSize={{base: "4xl", lgDown: "3xl"}}
        >
            {children}
        </Heading>
    );
}

function ContentSectionContainer(props: IContentSectionContainerProps) {
    const {children} = props;

    return (
        <Container display="flex" flexDirection="column" flexGrow="1">
            {children}
        </Container>
    );
}

function ContentSectionRoot(props: IContentSectionRootProps) {
    const {children} = props;

    return (
        <Box
            as="section"
            display="flex"
            flexDirection="column"
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
    Description: ContentSectionDescription,
    Pagination: ContentSectionPagination,
    Prose: ContentSectionProse,
    Root: ContentSectionRoot,
    Title: ContentSectionTitle,
} as const;

export default ContentSection;
