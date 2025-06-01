import {Code, Text} from "@chakra-ui/react";

import {isRouteErrorResponse} from "react-router";

import PromptShell from "~/components/shell/prompt_shell";

export const TITLE = "Server Error.";

export type IError500Props = {
    error: unknown;
};

export default function Error500(props: IError500Props) {
    const {error} = props;

    let message = "Error: Unknown internal server error";

    if (isRouteErrorResponse(error)) {
        message = error.data;
    } else if (error instanceof Error) {
        message = `${error.name}: ${error.message}`;
    }

    return (
        <PromptShell title={TITLE} query="Error">
            <Text>The server had an error while loading this page.</Text>
            <Code>{message}</Code>
        </PromptShell>
    );
}
