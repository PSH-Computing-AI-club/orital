import type {RadioCardItemProps, RadioCardRootProps} from "@chakra-ui/react";
import {HStack, Icon, RadioCard, useRadioCardContext} from "@chakra-ui/react";

import type {ReactElement, ReactNode} from "react";

export interface IRadioCardGroupOptionProps
    extends Omit<RadioCardItemProps, "children"> {
    readonly icon?: ReactElement;

    readonly label: ReactNode;

    readonly value: string;
}

export interface IRadioCardGroupRootProps extends RadioCardRootProps {}

function RadioCardGroupOption(props: IRadioCardGroupOptionProps) {
    const {colorPalette = "current", icon, label, value, ...rest} = props;

    const {getRootProps} = useRadioCardContext();
    const isDisabled =
        typeof (getRootProps() as {["data-disabled"]: string | undefined})[
            "data-disabled"
        ] === "string";

    return (
        <RadioCard.Item
            disabled={isDisabled}
            value={value}
            colorPalette={colorPalette}
            css={{
                "&[data-disabled]": {
                    cursor: "disabled",
                },

                "&:not([data-disabled])[data-state=unchecked]": {
                    borderColor: `${colorPalette}.solid`,
                    cursor: "pointer",
                    color: `${colorPalette}.fg`,
                },
            }}
            {...rest}
        >
            <RadioCard.ItemHiddenInput />

            <RadioCard.ItemControl color="currentcolor">
                {icon ? <Icon fontSize="2xl">{icon}</Icon> : undefined}

                <RadioCard.ItemText flexGrow="unset">
                    {label}
                </RadioCard.ItemText>
            </RadioCard.ItemControl>
        </RadioCard.Item>
    );
}

function RadioCardGroupRoot(props: IRadioCardGroupRootProps) {
    const {children, ...rest} = props;

    return (
        <RadioCard.Root
            variant="solid"
            orientation="vertical"
            align="center"
            justify="center"
            alignSelf="stretch"
            {...rest}
        >
            <HStack flexGrow="1" alignItems="stretch" justifyContent="stretch">
                {children}
            </HStack>
        </RadioCard.Root>
    );
}

const RadioCardGroup = {
    Option: RadioCardGroupOption,
    Root: RadioCardGroupRoot,
};

export default RadioCardGroup;
