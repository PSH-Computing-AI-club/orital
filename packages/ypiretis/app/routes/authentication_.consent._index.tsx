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

import {useCallback, useMemo} from "react";

import {
    Form,
    data,
    redirect,
    useActionData,
    useNavigate,
    useNavigation,
} from "react-router";

import * as v from "valibot";

import {validateFormData} from "~/.server/guards/validation";

import {deleteOne as deleteOneCallbackToken} from "~/.server/services/callback_tokens_service";
import {
    EVENT_CONSENT_AUTHORIZED,
    EVENT_CONSENT_REVOKED,
    findOneByToken as findOneConsentTokenByToken,
} from "~/.server/services/consent_tokens_service";
import {insertOne as insertOneGrantToken} from "~/.server/services/grant_tokens_service";
import {requireGuestSession} from "~/.server/services/users_service";

import TimeDeltaText from "~/components/common/time_delta_text";
import SearchIcon from "~/components/icons/search_icon";
import UserPlusIcon from "~/components/icons/user_plus_icon";

import PromptShell from "~/components/shell/prompt_shell";

import withHashLoader from "~/hooks/hash_loader";
import type {IUseTimeoutOptions} from "~/hooks/timeout";
import useTimeout from "~/hooks/timeout";

import {
    ACCOUNT_PROVIDER_DOMAIN,
    ACCOUNT_PROVIDER_NAME,
    APP_NAME,
} from "~/utils/constants";
import {alphanumerical, token} from "~/utils/valibot";

import type {Route} from "./+types/authentication_.consent._index";

const ACTION_ERROR_TYPES = {
    unauthorized: "TYPE_UNAUTHORIZED",
} as const;

const ACTION_FORM_DATA_SCHEMA = v.object({
    action: v.pipe(v.string(), v.picklist(["authorize", "revoke"])),

    consentToken: v.pipe(v.string(), token("TCSN")),
});

const HASH_LOADER_HASH_SCHEMA = v.object({
    accountID: v.pipe(v.string(), v.nonEmpty(), alphanumerical),

    consentToken: v.pipe(v.string(), token("TCSN")),

    consentTokenExpiresAt: v.pipe(
        v.string(),
        v.transform((value) => Number(value)),
        v.number(),
    ),
});

const useHashLoader = withHashLoader((hash) => {
    const searchParams = new URLSearchParams(hash);

    return v.parse(
        HASH_LOADER_HASH_SCHEMA,
        Object.fromEntries(searchParams.entries()),
    );
});

interface IActionError {
    readonly error: (typeof ACTION_ERROR_TYPES)[keyof typeof ACTION_ERROR_TYPES];
}

export async function action(actionArgs: Route.ActionArgs) {
    const {request} = actionArgs;

    await requireGuestSession(request);

    const {action, consentToken} = await validateFormData(
        ACTION_FORM_DATA_SCHEMA,
        actionArgs,
    );

    const consentTokenData = await findOneConsentTokenByToken(consentToken);

    if (consentTokenData === null) {
        return data(
            {
                error: ACTION_ERROR_TYPES.unauthorized,
            } satisfies IActionError,

            {
                status: 401,
            },
        );
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

export async function loader(loaderArgs: Route.LoaderArgs) {
    const {request} = loaderArgs;

    await requireGuestSession(request);
}

function ErrorText() {
    const {error} = useActionData<IActionError>() ?? {};

    switch (error) {
        case ACTION_ERROR_TYPES.unauthorized:
            return (
                <Text color="fg.error">
                    You are unauthorized to authorize this log-in.
                </Text>
            );
    }
}

export default function AuthenticationConsent() {
    const {accountID, consentToken, consentTokenExpiresAt} =
        useHashLoader() ?? {};

    const navigate = useNavigate();
    const navigation = useNavigation();

    const onTimeout = useCallback(() => {
        navigate("/authentication/consent/expired", {
            replace: true,
        });
    }, [navigate]);

    const useTimeoutOptions = useMemo<IUseTimeoutOptions>(
        () => ({
            onTimeout,
            duration: (consentTokenExpiresAt ?? 0) - Date.now(),
            enabled: !!consentTokenExpiresAt,
        }),
        [consentTokenExpiresAt, onTimeout],
    );

    useTimeout(useTimeoutOptions);

    return (
        <>
            <PromptShell.Title title="Authorize Login?" query="Login" />

            <PromptShell.Body>
                <noscript>
                    <Text>
                        JavaScript is{" "}
                        <Strong color="red.solid">required</Strong> to log-in.
                    </Text>
                </noscript>

                <Text color="red.fg">
                    {typeof consentTokenExpiresAt !== "undefined" ? (
                        <>
                            This login will expire in{" "}
                            <TimeDeltaText
                                endMilliseconds={consentTokenExpiresAt}
                            />
                            .
                        </>
                    ) : (
                        <br />
                    )}
                </Text>

                <Text>
                    You are about to log-in with the account:
                    <Code
                        variant="solid"
                        fontWeight="bold"
                        marginInlineStart="2"
                    >
                        {accountID}@{ACCOUNT_PROVIDER_DOMAIN}
                    </Code>
                </Text>

                <ErrorText />

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
                            <Strong color="cyan.solid">
                                {APP_NAME} account
                            </Strong>
                            , if one does not exist.
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
            </PromptShell.Body>
        </>
    );
}
