import {
    ChakraProvider,
    createSystem,
    defaultConfig,
    defineConfig,
    defineTokens,
} from "@chakra-ui/react";

import type {PropsWithChildren} from "react";

const THEME_CONFIG = defineConfig({
    theme: {
        tokens: {
            colors: defineTokens.colors({
                // **SOURCE:** https://brand.psu.edu/design-toolkit/design-essentials

                beaverblue: {
                    600: {value: "#1E407C"},
                },

                nittanynavy: {
                    600: {value: "#001E44"},
                },
            }),

            fonts: defineTokens.fonts({
                heading: {
                    value: "PixeloidSans",
                },

                body: {
                    value: "PixeloidSans",
                },

                mono: {
                    value: "Pixeloid-Mono",
                },
            }),

            radii: defineTokens.radii({
                "2xs": {
                    value: 0,
                },

                xs: {
                    value: 0,
                },

                sm: {
                    value: 0,
                },

                md: {
                    value: 0,
                },

                lg: {
                    value: 0,
                },

                xl: {
                    value: 0,
                },

                "2xl": {
                    value: 0,
                },

                "3xl": {
                    value: 0,
                },

                "4xl": {
                    value: 0,
                },

                full: {
                    value: 0,
                },
            }),
        },

        semanticTokens: {
            colors: {
                beaverblue: {
                    solid: {
                        value: "{colors.beaverblue.600}",
                    },
                },

                nittanyblue: {
                    solid: {
                        value: "{colors.nittanyblue.600}",
                    },
                },
            },
        },
    },
});

const THEME_SYSTEM = createSystem(defaultConfig, THEME_CONFIG);

export type IThemedChakraProviderProps = PropsWithChildren<{}>;

export default function ThemedChakraProvider(
    props: IThemedChakraProviderProps,
) {
    const {children} = props;

    return <ChakraProvider value={THEME_SYSTEM}>{children}</ChakraProvider>;
}
