import type {PropsWithChildren} from "react";

import type {MetaFunction} from "react-router";
import {
    isRouteErrorResponse,
    Links,
    Meta,
    Outlet,
    Scripts,
    ScrollRestoration,
} from "react-router";

import Error401, {TITLE as ERROR_401_TITLE} from "~/errors/error_401";
import Error403, {TITLE as ERROR_403_TITLE} from "~/errors/error_403";
import Error404, {TITLE as ERROR_404_TITLE} from "~/errors/error_404";
import Error500, {TITLE as ERROR_500_TITLE} from "~/errors/error_500";

import ThemedChakraProvider from "~/providers/themed_chakra_provider";

import {APP_NAME} from "~/utils/constants";

import type {Route} from "./+types/root";

import "~/styles/fonts.css";

export const meta = ((metaArgs) => {
    const {error} = metaArgs;

    let title: string | null = null;

    if (error) {
        title = ERROR_500_TITLE;

        if (isRouteErrorResponse(error)) {
            switch (error.status) {
                case 401:
                    title = ERROR_401_TITLE;

                    break;

                case 403:
                    title = ERROR_403_TITLE;

                    break;

                case 404:
                    title = ERROR_404_TITLE;

                    break;
            }
        }
    }

    return [
        {
            title: title ? `${title} :: ${APP_NAME}` : APP_NAME,
        },
    ];
}) satisfies MetaFunction;

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
            case 401:
                Component = Error401;

                break;

            case 403:
                Component = Error403;

                break;

            case 404:
                Component = Error404;

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
