import {Button, Strong, Text} from "@chakra-ui/react";

import {Form, redirect, useNavigation} from "react-router";

import * as v from "valibot";

import {validateFormData} from "~/.server/guards/validation";

import {
    getRevokeHeaders,
    requireAuthenticatedSession,
} from "~/.server/services/users_service";

import PromptShell from "~/components/shell/prompt_shell";

import type {Route} from "./+types/authentication_.log-out._index";

const ACTION_FORM_DATA_SCHEMA = v.object({
    action: v.pipe(v.string(), v.picklist(["log-out"])),
});

export async function action(actionArgs: Route.ActionArgs) {
    const {session} = await requireAuthenticatedSession(actionArgs);

    await validateFormData(ACTION_FORM_DATA_SCHEMA, actionArgs);

    const headers = await getRevokeHeaders(actionArgs, session);

    return redirect("/", {
        headers,
    });
}

export async function loader(loaderArgs: Route.LoaderArgs) {
    await requireAuthenticatedSession(loaderArgs);
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
