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
                    50: {
                        value: "#e9ecf2",
                    },

                    100: {
                        value: "#c7cfde",
                    },

                    200: {
                        value: "#a5b3cb",
                    },

                    300: {
                        value: "#8396b7",
                    },

                    400: {
                        value: "#6279a3",
                    },

                    500: {
                        value: "#405d90",
                    },

                    600: {
                        value: "#1E407C",
                    },

                    700: {
                        value: "#1e407c",
                    },

                    800: {
                        value: "#1a3669",
                    },

                    900: {
                        value: "#152d57",
                    },

                    950: {
                        value: "#112344",
                    },
                },

                nittanynavy: {
                    50: {
                        value: "#e6e9ec",
                    },

                    100: {
                        value: "#bfc7d0",
                    },

                    200: {
                        value: "#99a5b4",
                    },

                    300: {
                        value: "#738398",
                    },

                    400: {
                        value: "#4d627c",
                    },

                    500: {
                        value: "#264060",
                    },

                    600: {
                        value: "#001E44",
                    },

                    700: {
                        value: "#001a3a",
                    },

                    800: {
                        value: "#001a3a",
                    },

                    900: {
                        value: "#001530",
                    },

                    950: {
                        value: "#001125",
                    },
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
