import type {PropsWithChildren} from "react";

import {Links, Meta, Outlet, Scripts, ScrollRestoration} from "react-router";

import {default as ErrorBoundarySelector} from "./errors";

import {ThemedChakraProvider} from "~/state/themed_chakra";

import type {Route} from "./+types/root";

import "~/styles/fonts.css";

export function Layout(props: PropsWithChildren) {
    const {children} = props;

    return (
        <html lang="en">
            <head>
                <meta charSet="utf-8" />

                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1"
                />

                <link
                    rel="icon"
                    type="image/png"
                    href="/favicon-96x96.png"
                    sizes="96x96"
                />

                <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
                <link rel="shortcut icon" href="/favicon.ico" />

                <link
                    rel="apple-touch-icon"
                    sizes="180x180"
                    href="/apple-touch-icon.png"
                />

                <link rel="manifest" href="/site.webmanifest" />

                <Meta />
                <Links />
            </head>

            <body>
                {children}

                <ScrollRestoration />
                <Scripts />
            </body>
        </html>
    );
}

export function ErrorBoundary(props: Route.ErrorBoundaryProps) {
    return (
        <ThemedChakraProvider>
            <ErrorBoundarySelector {...props} />
        </ThemedChakraProvider>
    );
}

export default function Root() {
    return (
        <ThemedChakraProvider>
            <Outlet />
        </ThemedChakraProvider>
    );
}
