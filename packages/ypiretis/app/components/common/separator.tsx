import type {SeparatorProps} from "@chakra-ui/react";
import {Separator as ChakraSeparator} from "@chakra-ui/react";

export interface ISeparatorHorizontalProps extends SeparatorProps {}

export interface ISeparatorVerticalProps extends SeparatorProps {}

function SeparatorHorizontal(props: ISeparatorHorizontalProps) {
    return (
        <ChakraSeparator
            borderColor="currentcolor"
            inlineSize="full"
            opacity="0.2"
            {...props}
        />
    );
}

function SeparatorVertical(props: ISeparatorVerticalProps) {
    return (
        <ChakraSeparator
            orientation="vertical"
            borderColor="currentcolor"
            blockSize="full"
            opacity="0.2"
            {...props}
        />
    );
}

const Separator = {
    Horizontal: SeparatorHorizontal,
    Vertical: SeparatorVertical,
} as const;

export default Separator;
