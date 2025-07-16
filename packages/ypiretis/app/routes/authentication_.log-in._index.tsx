import {
    Button,
    Field,
    Input,
    InputGroup,
    Strong,
    Text,
    VStack,
} from "@chakra-ui/react";

import type {ReactMaskOpts} from "react-imask";
import {useIMask} from "react-imask";

import {Form, redirect, useNavigation} from "react-router";

import * as v from "valibot";

import {validateFormData} from "~/.server/guards/validation";

import AuthenticationMail from "~/.server/mails/authentication_mail";
import {queueEmail} from "~/.server/services/email_service";

import {insertOne as insertOneCallbackToken} from "~/.server/services/callback_tokens_service";
import {insertOne as insertOneConsentToken} from "~/.server/services/consent_tokens_service";
import {commitSession, getSession} from "~/.server/services/flash_service";
import {requireGuestSession} from "~/.server/services/users_service";

import PromptShell from "~/components/shell/prompt_shell";

import {
    ACCOUNT_PROVIDER_DOMAIN,
    ACCOUNT_PROVIDER_NAME,
} from "~/utils/constants";
import {EXPRESSION_ALPHANUMERICAL, alphanumerical} from "~/utils/valibot";

import type {Route} from "./+types/authentication_.log-in._index";

const ACTION_FORM_DATA_SCHEMA = v.object({
    accountID: v.pipe(v.string(), v.nonEmpty(), alphanumerical),

    action: v.pipe(v.string(), v.picklist(["log-in"])),
});

const MASK_OPTIONS = {
    mask: new RegExp(EXPRESSION_ALPHANUMERICAL.toString().slice(1, -2)),
} satisfies ReactMaskOpts;

export async function action(actionArgs: Route.ActionArgs) {
    const {request} = actionArgs;

    await requireGuestSession(request);

    const {accountID} = await validateFormData(
        ACTION_FORM_DATA_SCHEMA,
        actionArgs,
    );

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

    const session = await getSession(request);

    session.set("bearer", callbackToken.expose());

    const headers = await commitSession(session);

    return redirect(
        `/authentication/log-in/pending/?${new URLSearchParams({
            callbackTokenExpiresAt:
                callbackTokenExpiresAt.epochMilliseconds.toString(),
        })}`,

        {
            headers,
        },
    );
}

export async function loader(loaderArgs: Route.LoaderArgs) {
    const {request} = loaderArgs;

    await requireGuestSession(request);
}

export default function AuthenticationLogIn(_props: Route.ComponentProps) {
    const navigation = useNavigation();

    const {ref: maskRef} = useIMask(MASK_OPTIONS);

    return (
        <>
            <PromptShell.Title
                title={`Log-In via ${ACCOUNT_PROVIDER_NAME}.`}
                query={ACCOUNT_PROVIDER_NAME}
                // @ts-expect-error - **HACK:** Our custom colors are not typed.
                color="beaverblue.solid"
            />

            <PromptShell.Body>
                <noscript>
                    <Text>
                        JavaScript is{" "}
                        <Strong color="red.solid">required</Strong> to log-in.
                    </Text>
                </noscript>

                <Form method="POST">
                    <VStack gap="4">
                        <Field.Root required>
                            <Field.Label>
                                {ACCOUNT_PROVIDER_NAME} ID{" "}
                                <Field.RequiredIndicator />
                            </Field.Label>

                            <InputGroup
                                endAddon={
                                    <>
                                        <Strong>@</Strong>{" "}
                                        {ACCOUNT_PROVIDER_DOMAIN}
                                    </>
                                }
                            >
                                <Input
                                    // @ts-expect-error - **HACK:** I am supplying the proper type but
                                    // the masking library does not like Chakra's typing.
                                    ref={maskRef}
                                    name="accountID"
                                    placeholder="ex. don5092"
                                    textAlign="right"
                                />
                            </InputGroup>
                        </Field.Root>

                        <Button
                            disabled={navigation.state !== "idle"}
                            colorPalette="green"
                            type="submit"
                            name="action"
                            value="log-in"
                            width="full"
                        >
                            Log-In
                        </Button>
                    </VStack>
                </Form>
            </PromptShell.Body>
        </>
    );
}
