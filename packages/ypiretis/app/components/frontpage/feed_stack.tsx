import {VStack} from "@chakra-ui/react";

import type {PropsWithChildren} from "react";

export interface IFeedStackRootProps extends PropsWithChildren {}

function FeedStackRoot(props: IFeedStackRootProps) {
    const {children} = props;

    return (
        <VStack gap="4" alignItems="stretch">
            {children}
        </VStack>
    );
}

const FeedStack = {
    Root: FeedStackRoot,
} as const;

export default FeedStack;
