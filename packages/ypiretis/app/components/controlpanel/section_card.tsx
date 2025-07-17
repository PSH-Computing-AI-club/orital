import type {
    CardBodyProps,
    CardRootProps,
    CardFooterProps,
    CardTitleProps,
    TextProps,
} from "@chakra-ui/react";
import {Card, Text} from "@chakra-ui/react";

export interface ISectionCardFooterProps extends CardFooterProps {}

export interface ISectionCardTextProps extends TextProps {}

export interface ISectionCardTitleProps extends CardTitleProps {}

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
        <Card.Title display="flex" gap="2" alignItems="center" {...rest}>
            {children}
        </Card.Title>
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
    Text: SectionCardText,
    Title: SectionCardTitle,
} as const;

export default SectionCard;
