import type {StackProps} from "@chakra-ui/react";
import {VStack} from "@chakra-ui/react";

import type {RefAttributes} from "react";

export type IScrollableListAreaProps = StackProps &
    RefAttributes<HTMLDivElement>;

export default function ScrollableListArea(props: IScrollableListAreaProps) {
    const {children, ...rest} = props;

    return (
        <VStack
            alignItems="stretch"
            gap="2"
            padding="3"
            maxBlockSize="full"
            bg="bg.muted"
            borderColor="border"
            borderStyle="solid"
            borderWidth="thin"
            overflowBlock="auto"
            overflowInline="hidden"
            {...rest}
        >
            {children}
        </VStack>
    );
}
