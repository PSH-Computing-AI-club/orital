import {
    Button,
    Code,
    Flex,
    Group,
    List,
    Span,
    Strong,
    Text,
} from "@chakra-ui/react";

import {Form, data, redirect, useNavigate, useNavigation} from "react-router";

import * as v from "valibot";

import {deleteOne as deleteOneCallbackToken} from "~/.server/services/callback_tokens_service";
import {
    EVENT_CONSENT_AUTHORIZED,
    EVENT_CONSENT_REVOKED,
    findOneByToken as findOneConsentTokenByToken,
} from "~/.server/services/consent_tokens_service";
import {insertOne as insertOneGrantToken} from "~/.server/services/grant_tokens_service";
import {requireGuestSession} from "~/.server/services/users_service";

import SearchIcon from "~/components/icons/search_icon";
import UserPlusIcon from "~/components/icons/user_plus_icon";

import PromptShell from "~/components/shell/prompt_shell";

import withHashLoader from "~/hooks/hash_loader";
import useTimeout from "~/hooks/timeout";

import {
    ACCOUNT_PROVIDER_DOMAIN,
    ACCOUNT_PROVIDER_NAME,
    APP_NAME,
} from "~/utils/constants";
import {wrapMetaFunction} from "~/utils/meta";
import {alphanumerical, token} from "~/utils/valibot";

import type {Route} from "./+types/authentication.consent._index";

const TITLE = "Authorize Login?";

const QUERY = "Login";

const ACTION_SCHEMA = v.object({
    action: v.pipe(v.string(), v.picklist(["authorize", "revoke"])),

    consentToken: v.pipe(v.string(), token("TCSN")),
});

const CLIENT_LOADER_SCHEMA = v.object({
    accountID: v.pipe(v.string(), v.minLength(1), alphanumerical),

    consentToken: v.pipe(v.string(), token("TCSN")),

    consentTokenExpiresAt: v.pipe(
        v.string(),
        v.transform((value) => parseInt(value, 10)),
        v.number(),
    ),
});

export const meta = wrapMetaFunction(() => {
    return [
        {
            title: TITLE,
        },
    ];
});

export function loader(loaderArgs: Route.LoaderArgs) {
    const {request} = loaderArgs;

    return requireGuestSession(request);
}

const useHashLoader = withHashLoader((hash) => {
    const searchParams = new URLSearchParams(hash);

    return v.parse(
        CLIENT_LOADER_SCHEMA,
        Object.fromEntries(searchParams.entries()),
    );
});

export async function action(actionArgs: Route.ActionArgs) {
    const {request} = actionArgs;

    await requireGuestSession(request);

    const formData = await request.formData();

    const {
        output: actionData,
        issues,
        success,
    } = v.safeParse(ACTION_SCHEMA, Object.fromEntries(formData.entries()));

    if (!success) {
        const {nested: errors} = v.flatten(issues);

        return data(
            {
                errors,
            },

            {
                status: 400,
            },
        );
    }

    const {action, consentToken} = actionData;

    const consentTokenData = await findOneConsentTokenByToken(consentToken);

    if (consentTokenData === null) {
        throw data("Unauthorized", 401);
    }

    const {accountID, callbackTokenID} = consentTokenData;

    await deleteOneCallbackToken(callbackTokenID);

    const {expiresAt: grantTokenExpiresAt, token: grantToken} =
        await insertOneGrantToken({
            accountID,
        });

    switch (action) {
        case "authorize":
            EVENT_CONSENT_AUTHORIZED.dispatch({
                callbackTokenID,
                grantToken,
                grantTokenExpiresAt,
            });

            return redirect("/authentication/consent/authorized");

        case "revoke":
            EVENT_CONSENT_REVOKED.dispatch({
                callbackTokenID,
            });

            return redirect("/authentication/consent/revoked");
    }
}

export default function AuthenticationConsent() {
    const {accountID, consentToken, consentTokenExpiresAt} =
        useHashLoader() ?? {};

    const navigate = useNavigate();
    const navigation = useNavigation();

    useTimeout(
        () => {
            navigate("/authentication/consent/expired", {
                replace: true,
            });
        },

        {
            duration: (consentTokenExpiresAt ?? 0) - Date.now(),
            enabled: !!consentTokenExpiresAt,
        },
    );

    return (
        <PromptShell title={TITLE} query={QUERY}>
            <noscript>
                <Text>
                    JavaScript is <Strong color="red.solid">required</Strong> to
                    log-in.
                </Text>
            </noscript>

            <Text>
                You are about to log-in with the account:
                <Code variant="solid" fontWeight="bold" marginInlineStart="2">
                    {accountID}@{ACCOUNT_PROVIDER_DOMAIN}
                </Code>
            </Text>

            <Text>
                This will <Strong color="green.solid">authorize</Strong>{" "}
                {APP_NAME} to do the following:
            </Text>

            <List.Root gap="4" variant="plain" align="center">
                <List.Item gap="2">
                    <List.Indicator color="green.solid" asChild>
                        <Flex alignItems="center">
                            <UserPlusIcon />
                        </Flex>
                    </List.Indicator>

                    <Span>
                        Create a&nbsp;
                        <Strong color="cyan.solid">{APP_NAME} account</Strong>,
                        if one does not exist.
                    </Span>
                </List.Item>

                <List.Item gap="2">
                    <List.Indicator color="green.solid" asChild>
                        <Flex alignItems="center">
                            <SearchIcon />
                        </Flex>
                    </List.Indicator>

                    <Span>
                        Retrieve your full name from&nbsp;
                        <Strong color="cyan.solid">
                            {ACCOUNT_PROVIDER_NAME}
                        </Strong>
                        .
                    </Span>
                </List.Item>
            </List.Root>

            <Form method="POST">
                {
                    // **HACK:** We need to force a full re-render here due to
                    // Chakra UI's disabled prop on `Button` causing a hydration
                    // mismatch.
                    consentToken ? (
                        <>
                            <input
                                type="hidden"
                                name="consentToken"
                                value={consentToken}
                            />

                            <Group gap="4" grow>
                                <Button
                                    disabled={navigation.state !== "idle"}
                                    variant="ghost"
                                    colorPalette="red"
                                    type="submit"
                                    name="action"
                                    value="revoke"
                                >
                                    Revoke
                                </Button>

                                <Button
                                    disabled={navigation.state !== "idle"}
                                    colorPalette="green"
                                    type="submit"
                                    name="action"
                                    value="authorize"
                                >
                                    Authorize
                                </Button>
                            </Group>
                        </>
                    ) : (
                        <>
                            <Group gap="4" grow>
                                <Button
                                    variant="ghost"
                                    colorPalette="red"
                                    type="submit"
                                    name="action"
                                    value="revoke"
                                    disabled
                                >
                                    Revoke
                                </Button>

                                <Button
                                    colorPalette="green"
                                    type="submit"
                                    name="action"
                                    value="authorize"
                                    disabled
                                >
                                    Authorize
                                </Button>
                            </Group>
                        </>
                    )
                }
            </Form>
        </PromptShell>
    );
}
