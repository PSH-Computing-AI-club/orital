import {Strong, Text} from "@chakra-ui/react";

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

export default function AuthenticationConsentUnauthorized() {
    return (
        <PromptShell title={TITLE} query={QUERY} color="red.solid">
            <Text>
                The login you are trying to handle has{" "}
                <Strong color="red.solid">already expired</Strong> or{" "}
                <Strong color="red.solid">does not exist</Strong>.
            </Text>

            <Text>
                You may safely close this page and return to your original
                browser window if you wish to log-in again.
            </Text>
        </PromptShell>
    );
}
