import {
    Container,
    Heading,
    Flex,
    HStack,
    Image,
    Spacer,
    Stack,
    VStack,
} from "@chakra-ui/react";

import type {PropsWithChildren} from "react";

import FrontpageShell from "./frontpage_shell";

interface IFrontpageFooterLinksContainerProps extends PropsWithChildren {}

interface IFrontpageFooterLinksTitleProps extends PropsWithChildren {}

interface IFrontpageFooterLinksBodyProps extends PropsWithChildren {}

interface IFrontpageFooterLinksRootProps extends PropsWithChildren {}

interface IFrontpageFooterContainerProps extends PropsWithChildren {}

interface IFrontpageFooterRootProps extends PropsWithChildren {}

function FrontpageFooterClubLinks() {
    return (
        <>
            <li>
                <FrontpageShell.InternalLink to="/engage" isNewTab>
                    Engage
                </FrontpageShell.InternalLink>
            </li>

            <li>
                <FrontpageShell.InternalLink to="/discord" isNewTab>
                    Discord
                </FrontpageShell.InternalLink>
            </li>

            <li>
                <FrontpageShell.InternalLink to="/github" isNewTab>
                    GitHub
                </FrontpageShell.InternalLink>
            </li>
        </>
    );
}

function FrontpageFooterSiteLinks() {
    return (
        <>
            <li>
                <FrontpageShell.InternalLink to="/">
                    Home
                </FrontpageShell.InternalLink>
            </li>

            <li>
                <FrontpageShell.InternalLink to="/news">
                    News
                </FrontpageShell.InternalLink>
            </li>

            <li>
                <FrontpageShell.InternalLink to="/events">
                    Events
                </FrontpageShell.InternalLink>
            </li>
        </>
    );
}

function FrontpageFooterLogo() {
    return (
        <Image
            src="/images/logo.monochrome.light.webp"
            alt="Footer 3D voxel art logo."
            objectFit="contain"
            blockSize={{base: "3xs", mdDown: "48"}}
        />
    );
}

function FrontpageFooterLinksContainer(
    props: IFrontpageFooterLinksContainerProps,
) {
    const {children} = props;

    return (
        <VStack as="ul" gap="2" alignItems="baseline">
            {children}
        </VStack>
    );
}

function FrontpageFooterLinksTitle(props: IFrontpageFooterLinksTitleProps) {
    const {children} = props;

    return <Heading>{children}</Heading>;
}

function FrontpageFooterLinksBody(props: IFrontpageFooterLinksBodyProps) {
    const {children} = props;

    return (
        <VStack gap="2" alignItems="baseline">
            {children}
        </VStack>
    );
}

function FrontpageFooterLinksRoot(props: IFrontpageFooterLinksRootProps) {
    const {children} = props;

    return (
        <HStack gap="8" justifyContent="center">
            {children}
        </HStack>
    );
}

function FrontpageFooterContainer(props: IFrontpageFooterContainerProps) {
    const {children} = props;

    return (
        <Container marginBlockStart="auto" asChild>
            <Stack gap="8" flexDirection={{base: "row", smDown: "column"}}>
                {children}
            </Stack>
        </Container>
    );
}

function FrontpageFooterRoot(props: IFrontpageFooterRootProps) {
    const {children} = props;

    return (
        <Flex
            as="footer"
            bg="bg.inverted"
            color="fg.inverted"
            backgroundImage="url('/images/border.horizontal.webp')"
            backgroundSize="512px"
            backgroundRepeat="repeat-x"
            marginBlockStart="auto"
            paddingBlock="8"
            paddingInline={{base: "4", lgDown: "0"}}
            blockSize={{base: "sm", smDown: "2xl"}}
        >
            {children}
        </Flex>
    );
}

export default function FrontpageFooter() {
    return (
        <FrontpageFooterRoot>
            <FrontpageFooterContainer>
                <FrontpageFooterLogo />

                <Spacer />

                <FrontpageFooterLinksRoot>
                    <FrontpageFooterLinksBody>
                        <FrontpageFooterLinksTitle>
                            Club
                        </FrontpageFooterLinksTitle>

                        <FrontpageFooterLinksContainer>
                            <FrontpageFooterClubLinks />
                        </FrontpageFooterLinksContainer>
                    </FrontpageFooterLinksBody>

                    <FrontpageFooterLinksBody>
                        <FrontpageFooterLinksTitle>
                            Site
                        </FrontpageFooterLinksTitle>

                        <FrontpageFooterLinksContainer>
                            <FrontpageFooterSiteLinks />
                        </FrontpageFooterLinksContainer>
                    </FrontpageFooterLinksBody>
                </FrontpageFooterLinksRoot>
            </FrontpageFooterContainer>
        </FrontpageFooterRoot>
    );
}
