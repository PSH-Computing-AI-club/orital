import {Separator as ChakraSeparator} from "@chakra-ui/react";

function SeparatorHorizontal() {
    return (
        <ChakraSeparator
            borderColor="currentcolor"
            inlineSize="full"
            opacity="0.2"
        />
    );
}

function SeparatorVertical() {
    return (
        <ChakraSeparator
            orientation="vertical"
            borderColor="currentcolor"
            blockSize="full"
            opacity="0.2"
        />
    );
}

const Separator = {
    Horizontal: SeparatorHorizontal,
    Vertical: SeparatorVertical,
} as const;

export default Separator;
