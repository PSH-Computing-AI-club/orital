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

interface IFrontpageFooterLinksRootProps extends PropsWithChildren {}

interface IFrontpageFooterContainerProps extends PropsWithChildren {}

interface IFrontpageFooterRootProps extends PropsWithChildren {}

function FrontpageFooterClubLinks() {
    return (
        <>
            <Heading>Club</Heading>

            <FrontpageShell.InternalLink to="/engage" isNewTab>
                Engage
            </FrontpageShell.InternalLink>

            <FrontpageShell.InternalLink to="/discord" isNewTab>
                Discord
            </FrontpageShell.InternalLink>

            <FrontpageShell.InternalLink to="/github" isNewTab>
                GitHub
            </FrontpageShell.InternalLink>
        </>
    );
}

function FrontpageFooterSiteLinks() {
    return (
        <>
            <Heading>Site</Heading>

            <FrontpageShell.InternalLink to="/news">
                News
            </FrontpageShell.InternalLink>

            <FrontpageShell.InternalLink to="/events">
                Events
            </FrontpageShell.InternalLink>

            <FrontpageShell.InternalLink to="/rooms/join" isNewTab>
                Join Room
            </FrontpageShell.InternalLink>
        </>
    );
}

function FrontpageFooterLinksContainer(
    props: IFrontpageFooterLinksContainerProps,
) {
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
        <Container marginBlockStart="auto">
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
            bg="bg.inverted"
            color="fg.inverted"
            backgroundImage="url('/images/footer.border.webp')"
            backgroundSize="512px"
            backgroundRepeat="repeat-x"
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
                <Image
                    objectFit="contain"
                    blockSize={{base: "3xs", mdDown: "48"}}
                    src="/images/logo.monochrome.light.webp"
                />

                <Spacer />

                <FrontpageFooterLinksRoot>
                    <FrontpageFooterLinksContainer>
                        <FrontpageFooterClubLinks />
                    </FrontpageFooterLinksContainer>

                    <FrontpageFooterLinksContainer>
                        <FrontpageFooterSiteLinks />
                    </FrontpageFooterLinksContainer>
                </FrontpageFooterLinksRoot>
            </FrontpageFooterContainer>
        </FrontpageFooterRoot>
    );
}
