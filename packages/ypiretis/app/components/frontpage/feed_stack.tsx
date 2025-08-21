import type {BoxProps, StackProps} from "@chakra-ui/react";
import {Box, VStack} from "@chakra-ui/react";

export interface IFeedStackItemProps extends BoxProps {}

export interface IFeedStackRootProps extends StackProps {}

function FeedStackItem(props: IFeedStackRootProps) {
    const {children, ...rest} = props;

    return (
        <Box as="li" {...rest}>
            {children}
        </Box>
    );
}

function FeedStackRoot(props: IFeedStackRootProps) {
    const {children, ...rest} = props;

    return (
        <VStack as="ol" gap="4" alignItems="stretch" {...rest}>
            {children}
        </VStack>
    );
}

const FeedStack = {
    Item: FeedStackItem,
    Root: FeedStackRoot,
} as const;

export default FeedStack;
