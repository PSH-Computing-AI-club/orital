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

import Links from "~/components/common/links";
import VersionText from "~/components/common/version_text";

interface IFooterLinksContainerProps extends PropsWithChildren {}

interface IFooterLinksTitleProps extends PropsWithChildren {}

interface IFooterLinksBodyProps extends PropsWithChildren {}

interface IFooterLinksRootProps extends PropsWithChildren {}

interface IFooterContainerProps extends PropsWithChildren {}

interface IFooterRootProps extends PropsWithChildren {}

function FooterClubLinks() {
    return (
        <>
            <li>
                <Links.InternalLink to="/discover-east" isNewTab>
                    Discover East
                </Links.InternalLink>
            </li>

            <li>
                <Links.InternalLink to="/discord" isNewTab>
                    Discord
                </Links.InternalLink>
            </li>

            <li>
                <Links.InternalLink to="/github" isNewTab>
                    GitHub
                </Links.InternalLink>
            </li>
        </>
    );
}

function FooterSiteLinks() {
    return (
        <>
            <li>
                <Links.InternalLink to="/">Home</Links.InternalLink>
            </li>

            <li>
                <Links.InternalLink to="/news">News</Links.InternalLink>
            </li>

            <li>
                <Links.InternalLink to="/events">Events</Links.InternalLink>
            </li>
        </>
    );
}

function FooterLogo() {
    return (
        <VStack gap="2">
            <Image
                src="/images/logo.monochrome.light.webp"
                alt="Footer 3D voxel art logo."
                objectFit="contain"
                blockSize={{base: "3xs", mdDown: "48"}}
            />

            <VersionText />
        </VStack>
    );
}

function FooterLinksContainer(props: IFooterLinksContainerProps) {
    const {children} = props;

    return (
        <VStack as="ul" gap="2" alignItems="baseline">
            {children}
        </VStack>
    );
}

function FooterLinksTitle(props: IFooterLinksTitleProps) {
    const {children} = props;

    return <Heading>{children}</Heading>;
}

function FooterLinksBody(props: IFooterLinksBodyProps) {
    const {children} = props;

    return (
        <VStack gap="2" alignItems="baseline">
            {children}
        </VStack>
    );
}

function FooterLinksRoot(props: IFooterLinksRootProps) {
    const {children} = props;

    return (
        <HStack gap="8" justifyContent="center">
            {children}
        </HStack>
    );
}

function FooterContainer(props: IFooterContainerProps) {
    const {children} = props;

    return (
        <Container marginBlockStart="auto" asChild>
            <Stack gap="8" flexDirection={{base: "row", smDown: "column"}}>
                {children}
            </Stack>
        </Container>
    );
}

function FooterRoot(props: IFooterRootProps) {
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

export default function Footer() {
    return (
        <FooterRoot>
            <FooterContainer>
                <FooterLogo />

                <Spacer />

                <FooterLinksRoot>
                    <FooterLinksBody>
                        <FooterLinksTitle>Club</FooterLinksTitle>

                        <FooterLinksContainer>
                            <FooterClubLinks />
                        </FooterLinksContainer>
                    </FooterLinksBody>

                    <FooterLinksBody>
                        <FooterLinksTitle>Site</FooterLinksTitle>

                        <FooterLinksContainer>
                            <FooterSiteLinks />
                        </FooterLinksContainer>
                    </FooterLinksBody>
                </FooterLinksRoot>
            </FooterContainer>
        </FooterRoot>
    );
}
