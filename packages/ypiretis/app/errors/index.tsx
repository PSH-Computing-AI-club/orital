import {isRouteErrorResponse} from "react-router";

import Error400 from "./error_400";
import Error401 from "./error_401";
import Error403 from "./error_403";
import Error404 from "./error_404";
import Error409 from "./error_409";
import Error500 from "./error_500";

import type {Route} from "../+types/root";

export interface IErrorBoundaryProps {
    readonly error: unknown;
}

function pickErrorBoundaryComponent(error: unknown) {
    if (isRouteErrorResponse(error)) {
        switch (error.status) {
            case 400:
                return Error400;

            case 401:
                return Error401;

            case 403:
                return Error403;

            case 404:
                return Error404;

            case 409:
                return Error409;
        }
    }

    return Error500;
}

export default function ErrorBoundary(props: Route.ErrorBoundaryProps) {
    const {error} = props;

    const BoundaryComponent = pickErrorBoundaryComponent(error);

    return <BoundaryComponent error={error} />;
}
