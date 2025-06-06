import type {PropsWithChildren} from "react";

import {
    isRouteErrorResponse,
    Links,
    Meta,
    Outlet,
    Scripts,
    ScrollRestoration,
} from "react-router";

import Error400 from "~/errors/error_400";
import Error401 from "~/errors/error_401";
import Error403 from "~/errors/error_403";
import Error404 from "~/errors/error_404";
import Error409 from "~/errors/error_409";
import Error500 from "~/errors/error_500";

import ThemedChakraProvider from "~/providers/themed_chakra_provider";

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
    const {error} = props;

    let Component = () => Error500({error});

    if (isRouteErrorResponse(error)) {
        switch (error.status) {
            case 400:
                Component = Error400;

                break;

            case 401:
                Component = Error401;

                break;

            case 403:
                Component = Error403;

                break;

            case 404:
                Component = Error404;

                break;

            case 409:
                Component = Error409;

                break;
        }
    }

    return (
        <ThemedChakraProvider>
            <Component />
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
