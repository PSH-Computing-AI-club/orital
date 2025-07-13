import {VStack} from "@chakra-ui/react";

import type {PropsWithChildren} from "react";

export interface IFeedStackItemProps extends PropsWithChildren {}

export interface IFeedStackRootProps extends PropsWithChildren {}

function FeedStackItem(props: IFeedStackRootProps) {
    const {children} = props;

    return <li>{children}</li>;
}

function FeedStackRoot(props: IFeedStackRootProps) {
    const {children} = props;

    return (
        <VStack as="ol" gap="4" alignItems="stretch">
            {children}
        </VStack>
    );
}

const FeedStack = {
    Item: FeedStackItem,
    Root: FeedStackRoot,
} as const;

export default FeedStack;
