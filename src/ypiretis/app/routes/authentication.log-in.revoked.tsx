import {Link, Strong, Text} from "@chakra-ui/react";

import PromptShell from "~/components/shell/prompt_shell";

import {wrapMetaFunction} from "~/utils/meta";

const TITLE = "Login Revoked.";

const QUERY = "Revoked";

export const meta = wrapMetaFunction(() => {
    return [
        {
            title: TITLE,
        },
    ];
});

export default function AuthenticationLogInExpired() {
    return (
        <PromptShell title={TITLE} query={QUERY} color="red.solid">
            <Text>
                The login you were trying to handle was{" "}
                <Strong color="red.solid">revoked</Strong>.
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
