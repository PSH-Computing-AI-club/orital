import {Card, Container, Flex, Image} from "@chakra-ui/react";

import type {PropsWithChildren} from "react";

export interface IFeatureSectionImageProps {
    readonly src: string;
}

export interface IFeatureSectionDescriptionProps extends PropsWithChildren {}

export interface IFeatureSectionTitleProps extends PropsWithChildren {}

export interface IFeatureSectionBodyProps extends PropsWithChildren {}

export interface IFeatureSectionContainerProps extends PropsWithChildren {}

export interface IFeatureSectionRootProps extends PropsWithChildren {}

function FeatureSectionDescription(props: IFeatureSectionDescriptionProps) {
    const {children} = props;

    return (
        <Card.Description
            color="fg.subtle"
            fontSize={{base: "2xl", lgDown: "xl"}}
        >
            {children}
        </Card.Description>
    );
}

function FeatureSectionTitle(props: IFeatureSectionTitleProps) {
    const {children} = props;

    return (
        <Card.Title
            as="h2"
            color="fg.inverted"
            fontSize={{base: "4xl", lgDown: "3xl"}}
            lineHeight="normal"
            textAlign={{base: "inherit", lgDown: "center"}}
        >
            {children}
        </Card.Title>
    );
}

function FeatureSectionImage(props: IFeatureSectionImageProps) {
    const {src} = props;

    return (
        <Image
            objectFit="contain"
            inlineSize="full"
            maxInlineSize="lg"
            src={src}
        />
    );
}

function FeatureSectionBody(props: IFeatureSectionBodyProps) {
    const {children} = props;

    return <Card.Body gap="8">{children}</Card.Body>;
}

function FeatureSectionContainer(props: IFeatureSectionContainerProps) {
    const {children} = props;

    return (
        <Container asChild>
            <Card.Root
                variant="subtle"
                gap={{base: "8", lgDown: "0"}}
                flexDirection={{base: "row", lgDown: "column"}}
                alignItems="center"
                justifyContent="space-between"
                bg="transparent"
                overflow="hidden"
            >
                {children}
            </Card.Root>
        </Container>
    );
}

function FeatureSectionRoot(props: IFeatureSectionRootProps) {
    const {children} = props;

    return (
        <Flex
            as="section"
            alignItems="center"
            bg="bg.inverted"
            color="fg.inverted"
            paddingBlock="8"
            paddingInline={{base: "4", lgDown: "0"}}
            minBlockSize="xl"
        >
            {children}
        </Flex>
    );
}

const FeatureSection = {
    Body: FeatureSectionBody,
    Container: FeatureSectionContainer,
    Description: FeatureSectionDescription,
    Image: FeatureSectionImage,
    Root: FeatureSectionRoot,
    Title: FeatureSectionTitle,
} as const;

export default FeatureSection;
