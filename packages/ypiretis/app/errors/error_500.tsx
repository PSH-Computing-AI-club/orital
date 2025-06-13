import {Code, Text} from "@chakra-ui/react";

import {isRouteErrorResponse} from "react-router";

import PromptShell from "~/components/shell/prompt_shell";

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
        <>
            <PromptShell.Title title="Server Error." query="Error" />
            <PromptShell.Body>
                <Text>The server had an error while loading this page.</Text>
                <Code>{message}</Code>
            </PromptShell.Body>
        </>
    );
}
