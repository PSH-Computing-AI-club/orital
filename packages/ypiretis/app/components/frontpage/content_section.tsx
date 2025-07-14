import {Box, Container, Heading, Spacer} from "@chakra-ui/react";

import type {PropsWithChildren} from "react";

import type {IPaginationProps} from "~/components/common/pagination";
import Pagination from "~/components/common/pagination";

export interface IContentSectionPaginationProps extends IPaginationProps {}

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
    Pagination: ContentSectionPagination,
    Root: ContentSectionRoot,
    Title: ContentSectionTitle,
} as const;

export default ContentSection;
