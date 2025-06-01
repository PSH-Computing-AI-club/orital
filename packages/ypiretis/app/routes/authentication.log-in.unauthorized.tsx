import {Link, Strong, Text} from "@chakra-ui/react";

import {data} from "react-router";

import PromptShell from "~/components/shell/prompt_shell";

import {wrapMetaFunction} from "~/utils/meta";

const TITLE = "Login Unauthorized.";

const QUERY = "Unauthorized";

export const meta = wrapMetaFunction(() => {
    return [
        {
            title: TITLE,
        },
    ];
});

export function loader() {
    return data("Unauthorized", 401);
}

export default function AuthenticationLogInUnauthorized() {
    return (
        <PromptShell title={TITLE} query={QUERY} color="red.solid">
            <Text>
                The login you are trying to handle has{" "}
                <Strong color="red.solid">already expired</Strong> or{" "}
                <Strong color="red.solid">does not exist</Strong>.
            </Text>

            <Text>
                Return to the{" "}
                <Link
                    href="/authentication/log-in"
                    variant="underline"
                    color="blue.solid"
                >
                    log-in
                </Link>{" "}
                page to log-in again.
            </Text>
        </PromptShell>
    );
}
