import {Button, Strong, Text} from "@chakra-ui/react";

import {Form, data, redirect, useActionData, useNavigation} from "react-router";

import * as v from "valibot";

import {
    getRevokeHeaders,
    requireAuthenticatedSession,
} from "~/.server/services/users_service";

import PromptShell from "~/components/shell/prompt_shell";

import type {Route} from "./+types/authentication_.log-out._index";

const ACTION_ERROR_TYPES = {
    validation: "TYPE_VALIDATION",
} as const;

const ACTION_FORM_DATA_SCHEMA = v.object({
    action: v.pipe(v.string(), v.picklist(["log-out"])),
});

interface IActionError {
    readonly error: (typeof ACTION_ERROR_TYPES)[keyof typeof ACTION_ERROR_TYPES];
}

export async function action(actionArgs: Route.ActionArgs) {
    const {request} = actionArgs;

    const {session} = await requireAuthenticatedSession(request);

    const formData = await request.formData();

    const {success} = v.safeParse(
        ACTION_FORM_DATA_SCHEMA,
        Object.fromEntries(formData.entries()),
    );

    if (!success) {
        return data(
            {
                error: ACTION_ERROR_TYPES.validation,
            } satisfies IActionError,

            {
                status: 400,
            },
        );
    }

    const headers = await getRevokeHeaders(request, session);

    return redirect("/", {
        headers,
    });
}

export async function loader(loaderArgs: Route.LoaderArgs) {
    const {request} = loaderArgs;

    await requireAuthenticatedSession(request);
}

function ErrorText() {
    const {error} = useActionData<IActionError>() ?? {};

    switch (error) {
        case ACTION_ERROR_TYPES.validation:
            return (
                <Text color="fg.error">
                    This should never happen. Contact the web master.
                </Text>
            );
    }
}

export default function AuthenticationLogOut(_props: Route.ComponentProps) {
    const navigation = useNavigation();

    return (
        <>
            <PromptShell.Title
                title="Log-Out of Account?"
                query="Log-Out"
                color="red.solid"
            />

            <PromptShell.Body>
                <Text>
                    Are you sure you want to{" "}
                    <Strong color="red.solid">log-out</Strong>?
                </Text>

                <ErrorText />

                <Form method="POST">
                    <Button
                        disabled={navigation.state !== "idle"}
                        colorPalette="red"
                        type="submit"
                        name="action"
                        value="log-out"
                        inlineSize="full"
                    >
                        Log-Out
                    </Button>
                </Form>
            </PromptShell.Body>
        </>
    );
}
