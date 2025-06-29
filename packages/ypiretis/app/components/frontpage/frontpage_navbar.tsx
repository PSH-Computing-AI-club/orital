import {Box, Container, Image, HStack, Spacer} from "@chakra-ui/react";

import type {PropsWithChildren} from "react";

import FrontpageShell from "~/components/frontpage/frontpage_shell";

import useObscuredSentinel from "~/hooks/obscured_sentinel";

interface IFrontpageNavbarLinksRootProps extends PropsWithChildren {}

interface IFrontpageNavbarContainerBorderProps {
    readonly isObscured: boolean;
}

interface IFrontpageNavbarContainerProps extends PropsWithChildren {
    readonly isObscured: boolean;
}

interface IFrontpageNavbarRootProps extends PropsWithChildren {}

function FrontpageNavbarLeftLinks() {
    return (
        <>
            <FrontpageShell.InternalLink to="/news">
                News
            </FrontpageShell.InternalLink>

            <FrontpageShell.InternalLink to="/events">
                Events
            </FrontpageShell.InternalLink>
        </>
    );
}

function FrontpageNavbarRightLinks() {
    return (
        <>
            <FrontpageShell.InternalLink to="/engage" isNewTab>
                Engage
            </FrontpageShell.InternalLink>

            <FrontpageShell.InternalLink to="/discord" isNewTab>
                Discord
            </FrontpageShell.InternalLink>
        </>
    );
}

function FrontpageNavbarLinksRoot(props: IFrontpageNavbarLinksRootProps) {
    const {children} = props;

    return (
        <HStack gap="4" alignItems="center" blockSize="full">
            {children}
        </HStack>
    );
}

function FrontpageNavbarContainerBorder(
    props: IFrontpageNavbarContainerBorderProps,
) {
    const {isObscured} = props;

    return (
        <Box
            position="absolute"
            inset="0"
            bg="bg.inverted"
            borderColor="border.inverted"
            borderStyle="solid"
            borderWidth="thin"
            zIndex="-1"
            visibility={isObscured ? undefined : "hidden"}
        />
    );
}

function FrontpageNavbarContainer(props: IFrontpageNavbarContainerProps) {
    const {children, isObscured} = props;

    return (
        <Container
            bg={isObscured ? "transparent" : "bg.inverted"}
            color="fg.inverted"
            blockSize="full"
        >
            {children}
        </Container>
    );
}

function FrontpageNavbarRoot(props: IFrontpageNavbarRootProps) {
    const {children} = props;

    return (
        <Box
            pos="sticky"
            insetBlockStart="8"
            blockSize="20"
            paddingInline="8"
            zIndex="2"
        >
            {children}
        </Box>
    );
}

export default function FrontpageNavbar() {
    const {isObscured, ObscuredSentinel} = useObscuredSentinel();

    return (
        <>
            {ObscuredSentinel}

            <FrontpageNavbarRoot>
                <FrontpageNavbarContainer isObscured={isObscured}>
                    <FrontpageNavbarContainerBorder isObscured={isObscured} />

                    <FrontpageNavbarLinksRoot>
                        <Spacer />

                        <FrontpageNavbarLeftLinks />

                        <Image
                            objectFit="contain"
                            blockSize="16"
                            src="/images/logo.monochrome.light.webp"
                        />

                        <FrontpageNavbarRightLinks />

                        <Spacer />
                    </FrontpageNavbarLinksRoot>
                </FrontpageNavbarContainer>
            </FrontpageNavbarRoot>
        </>
    );
}
