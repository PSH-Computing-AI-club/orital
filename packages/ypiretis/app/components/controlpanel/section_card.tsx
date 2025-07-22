import type {
    CardBodyProps,
    CardRootProps,
    CardFooterProps,
    CardTitleProps,
    StackProps,
    TextProps,
} from "@chakra-ui/react";
import {Card, Text, VStack} from "@chakra-ui/react";

export interface ISectionCardFooterProps extends CardFooterProps {}

export interface ISectionCardTextProps extends TextProps {}

export interface ISectionCardTitleProps extends CardTitleProps {}

export interface ISectionCardScrollableProps extends StackProps {}

export interface ISectionCardBodyProps extends CardBodyProps {}

export interface ISectionCardRootProps extends CardRootProps {}

function SectionCardFooter(props: ISectionCardFooterProps) {
    const {children, ...rest} = props;

    return <Card.Footer {...rest}>{children}</Card.Footer>;
}

function SectionCardText(props: ISectionCardTextProps) {
    const {children, ...rest} = props;

    return <Text {...rest}>{children}</Text>;
}

function SectionCardTitle(props: ISectionCardTitleProps) {
    const {children, ...rest} = props;

    return (
        <Card.Title
            as="h2"
            display="flex"
            gap="2"
            alignItems="center"
            {...rest}
        >
            {children}
        </Card.Title>
    );
}

function SectionCardScrollable(props: ISectionCardScrollableProps) {
    const {children, ...rest} = props;

    return (
        <VStack
            alignItems="stretch"
            gap="2"
            flexGrow="1"
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

function SectionCardBody(props: ISectionCardBodyProps) {
    const {children} = props;

    return (
        <Card.Body gap="4" maxBlockSize="full" overflow="hidden">
            {children}
        </Card.Body>
    );
}

function SectionCardRoot(props: ISectionCardRootProps) {
    const {children, ...rest} = props;

    return (
        <Card.Root as="section" {...rest}>
            {children}
        </Card.Root>
    );
}

const SectionCard = {
    Body: SectionCardBody,
    Footer: SectionCardFooter,
    Root: SectionCardRoot,
    Scrollable: SectionCardScrollable,
    Text: SectionCardText,
    Title: SectionCardTitle,
} as const;

export default SectionCard;
