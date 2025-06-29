import {Box, Container, Image, HStack, Spacer} from "@chakra-ui/react";

import {Outlet} from "react-router";

import FrontpageFooter from "~/components/frontpage/frontpage_footer";
import FrontpageShell from "~/components/frontpage/frontpage_shell";

import useObscuredSentinel from "~/hooks/obscured_sentinel";

export default function LandingLayout() {
    const {isObscured, ObscuredSentinel} = useObscuredSentinel();

    return (
        <>
            {ObscuredSentinel}

            <Box
                pos="sticky"
                insetBlockStart="8"
                blockSize="20"
                paddingInline="8"
                zIndex="2"
            >
                <Container
                    bg={isObscured ? "transparent" : "bg.inverted"}
                    color="fg.inverted"
                    blockSize="full"
                >
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

                    <HStack gap="4" alignItems="center" blockSize="full">
                        <Spacer />

                        <FrontpageShell.InternalLink to="/news">
                            News
                        </FrontpageShell.InternalLink>

                        <FrontpageShell.InternalLink to="/events">
                            Events
                        </FrontpageShell.InternalLink>

                        <Image
                            objectFit="contain"
                            blockSize="16"
                            src="/images/logo.monochrome.light.webp"
                        />

                        <FrontpageShell.InternalLink to="/engage" isNewTab>
                            Engage
                        </FrontpageShell.InternalLink>

                        <FrontpageShell.InternalLink to="/discord" isNewTab>
                            Discord
                        </FrontpageShell.InternalLink>

                        <Spacer />
                    </HStack>
                </Container>
            </Box>

            <Outlet />

            <FrontpageFooter />
        </>
    );
}
