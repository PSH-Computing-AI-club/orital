import type {
    EmptyStateContentProps,
    EmptyStateDescriptionProps,
    EmptyStateIndicatorProps,
    EmptyStateRootProps,
    EmptyStateTitleProps,
    StackProps,
} from "@chakra-ui/react";
import {EmptyState as _EmptyState, VStack} from "@chakra-ui/react";

export interface IEmptyStateDescriptionProps
    extends EmptyStateDescriptionProps {}

export interface IEmptyStateTitleProps extends EmptyStateTitleProps {}

export interface IEmptyStateBodyProps extends StackProps {}

export interface IEmptyStateIconProps extends EmptyStateIndicatorProps {}

export interface IEmptyStateContainerProps extends EmptyStateContentProps {}

export interface IEmptyStateRootProps extends EmptyStateRootProps {}

function EmptyStateDescription(props: IEmptyStateDescriptionProps) {
    const {children, ...rest} = props;

    return (
        <_EmptyState.Description {...rest}>{children}</_EmptyState.Description>
    );
}

function EmptyStateTitle(props: IEmptyStateTitleProps) {
    const {children, ...rest} = props;

    return <_EmptyState.Title {...rest}>{children}</_EmptyState.Title>;
}

function EmptyStateBody(props: IEmptyStateBodyProps) {
    const {children, ...rest} = props;

    return (
        <VStack textAlign="center" {...rest}>
            {children}
        </VStack>
    );
}

function EmptyStateIcon(props: IEmptyStateIconProps) {
    const {children, ...rest} = props;

    return <_EmptyState.Indicator {...rest}>{children}</_EmptyState.Indicator>;
}

function EmptyStateContainer(props: IEmptyStateContainerProps) {
    const {children, ...rest} = props;

    return <_EmptyState.Content {...rest}>{children}</_EmptyState.Content>;
}

function EmptyStateRoot(props: IEmptyStateRootProps) {
    const {children, ...rest} = props;

    return (
        <_EmptyState.Root
            size="lg"
            justifyContent="center"
            marginBlock="auto"
            {...rest}
        >
            {children}
        </_EmptyState.Root>
    );
}

const EmptyState = {
    Body: EmptyStateBody,
    Container: EmptyStateContainer,
    Description: EmptyStateDescription,
    Icon: EmptyStateIcon,
    Root: EmptyStateRoot,
    Title: EmptyStateTitle,
} as const;

export default EmptyState;
