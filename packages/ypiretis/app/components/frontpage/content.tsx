import {Box, Container} from "@chakra-ui/react";

import type {PropsWithChildren} from "react";

export interface IContentContainerProps extends PropsWithChildren {}

export interface IContentRootProps extends PropsWithChildren {}

function ContentContainer(props: IContentContainerProps) {
    const {children} = props;

    return <Container>{children}</Container>;
}

function ContentRoot(props: IContentRootProps) {
    const {children} = props;

    return (
        <Box flexGrow="1" bg="bg.muted" color="fg.inverted" paddingBlock="8">
            {children}
        </Box>
    );
}

const Content = {
    Container: ContentContainer,
    Root: ContentRoot,
} as const;

export default Content;
