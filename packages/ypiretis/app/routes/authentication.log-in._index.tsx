import {
    Button,
    Field,
    Input,
    InputGroup,
    Strong,
    Text,
    VStack,
} from "@chakra-ui/react";

import {Form, data, redirect, useNavigation} from "react-router";

import * as v from "valibot";

import AuthenticationMail from "~/.server/mails/authentication_mail";
import {queueEmail} from "~/.server/services/email_service";

import {insertOne as insertOneCallbackToken} from "~/.server/services/callback_tokens_service";
import {insertOne as insertOneConsentToken} from "~/.server/services/consent_tokens_service";
import {requireGuestSession} from "~/.server/services/users_service";

import PromptShell from "~/components/shell/prompt_shell";

import {
    ACCOUNT_PROVIDER_DOMAIN,
    ACCOUNT_PROVIDER_NAME,
} from "~/utils/constants";
import {wrapMetaFunction} from "~/utils/meta";
import {alphanumerical} from "~/utils/valibot";

import type {Route} from "./+types/authentication.log-in._index";

const TITLE = `Log-In via ${ACCOUNT_PROVIDER_NAME}.`;

const QUERY = ACCOUNT_PROVIDER_NAME;

const ACTION_SCHEMA = v.object({
    accountID: v.pipe(v.string(), v.minLength(1), alphanumerical),

    action: v.pipe(v.string(), v.picklist(["log-in"])),
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

    const {accountID} = actionData;

    const {
        expiresAt: callbackTokenExpiresAt,
        id: callbackTokenID,
        token: callbackToken,
    } = await insertOneCallbackToken();

    const {expiresAt: consentTokenExpiresAt, token: consentToken} =
        await insertOneConsentToken({
            accountID,
            callbackTokenID: callbackTokenID,
        });

    await queueEmail({
        to: `${accountID}@${ACCOUNT_PROVIDER_DOMAIN}`,

        accountID,
        consentToken,
        consentTokenExpiresAt,

        Component: AuthenticationMail,
    });

    return redirect(
        `/authentication/log-in/pending/#?${new URLSearchParams({
            callbackToken: callbackToken.expose(),
            callbackTokenExpiresAt:
                callbackTokenExpiresAt.epochMilliseconds.toString(),
        })}`,
    );
}

export default function AuthenticationLogIn(props: Route.ComponentProps) {
    const {actionData} = props;
    const {errors} = actionData ?? {};

    const navigation = useNavigation();

    return (
        <PromptShell title={TITLE} query={QUERY} color="beaverblue.solid">
            <noscript>
                <Text>
                    JavaScript is <Strong color="red.solid">required</Strong> to
                    log-in.
                </Text>
            </noscript>

            <Form method="POST">
                <VStack gap="4">
                    <Field.Root invalid={!!errors} required>
                        <Field.Label>
                            {ACCOUNT_PROVIDER_NAME} ID{" "}
                            <Field.RequiredIndicator />
                        </Field.Label>

                        <InputGroup
                            endAddon={
                                <>
                                    <Strong>@</Strong> {ACCOUNT_PROVIDER_DOMAIN}
                                </>
                            }
                        >
                            <Input
                                name="accountID"
                                placeholder="ex. don5092"
                                textAlign="right"
                            />
                        </InputGroup>

                        {errors?.accountID ? (
                            <Field.ErrorText>
                                {errors.accountID[0]}
                            </Field.ErrorText>
                        ) : null}
                    </Field.Root>

                    <Button
                        disabled={navigation.state !== "idle"}
                        colorPalette="green"
                        type="submit"
                        name="action"
                        value="log-in"
                        width="full"
                    >
                        Log In
                    </Button>
                </VStack>
            </Form>
        </PromptShell>
    );
}
