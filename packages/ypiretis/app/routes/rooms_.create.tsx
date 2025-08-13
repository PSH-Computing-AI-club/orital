import {Button, Field, Input, VStack} from "@chakra-ui/react";

import type {ReactMaskOpts} from "react-imask";
import {useIMask} from "react-imask";

import {Form, data, redirect, useActionData, useNavigation} from "react-router";

import * as v from "valibot";

import {
    findOneLiveByPresenterID,
    insertOneLive,
} from "~/.server/services/rooms_service";

import {requireAuthenticatedAdminSession} from "~/.server/services/users_service";

import PromptShell from "~/components/shell/prompt_shell";

import {validateFormData} from "~/guards/validation";

import {EXPRESSION_TITLE, title} from "~/utils/valibot";

import type {Route} from "./+types/rooms_.create";

const ACTION_ERROR_TYPES = {
    roomExists: "TYPE_ROOM_EXISTS",

    validation: "TYPE_VALIDATION",
} as const;

const ACTION_FORM_DATA_SCHEMA = v.object({
    action: v.pipe(v.string(), v.picklist(["create"])),

    title: v.pipe(v.string(), v.nonEmpty(), v.maxLength(32), title),
});

const DEFAULT_ROOM_TITLE = "A Presentation Room";

const MASK_OPTIONS = {
    mask: new RegExp(EXPRESSION_TITLE.toString().slice(1, -2)),
    maxLength: 32,
} satisfies ReactMaskOpts;

interface IActionError {
    readonly error: (typeof ACTION_ERROR_TYPES)[keyof typeof ACTION_ERROR_TYPES];
}

export async function action(actionArgs: Route.ActionArgs) {
    const {identifiable: user} =
        await requireAuthenticatedAdminSession(actionArgs);

    const {title} = await validateFormData(ACTION_FORM_DATA_SCHEMA, actionArgs);

    const {id: userID} = user;
    const existingRoom = findOneLiveByPresenterID(userID);

    if (existingRoom) {
        return data(
            {
                error: ACTION_ERROR_TYPES.roomExists,
            } satisfies IActionError,

            {
                status: 409,
            },
        );
    }

    const {roomID} = await insertOneLive({
        presenter: user,
        title,
    });

    return redirect(`/rooms/${roomID}/presenter`);
}

export async function loader(loaderArgs: Route.LoaderArgs) {
    await requireAuthenticatedAdminSession(loaderArgs);
}

function ErrorText() {
    const {error} = useActionData<IActionError>() ?? {};

    switch (error) {
        case ACTION_ERROR_TYPES.roomExists:
            return (
                <Field.ErrorText>You already have a live room.</Field.ErrorText>
            );

        case ACTION_ERROR_TYPES.validation:
            return (
                <Field.ErrorText>Invalid room title format.</Field.ErrorText>
            );
    }
}

export default function RoomsJoin(props: Route.ComponentProps) {
    const {actionData} = props;
    const {error} = actionData ?? {};

    const navigation = useNavigation();

    const {ref: maskRef} = useIMask(MASK_OPTIONS);

    return (
        <PromptShell.Root>
            <PromptShell.Sidebar />

            <PromptShell.Container>
                <PromptShell.Title
                    title="Create a Presentation Room."
                    query="Create"
                />

                <PromptShell.Body>
                    <Form method="POST">
                        <VStack gap="4">
                            <Field.Root invalid={!!error} required>
                                <Field.Label>
                                    Room Title
                                    <Field.RequiredIndicator />
                                </Field.Label>

                                <Input
                                    // @ts-expect-error - **HACK:** I am supplying the proper type but
                                    // the masking library does not like Chakra's typing.
                                    ref={maskRef}
                                    name="title"
                                    placeholder={`ex. ${DEFAULT_ROOM_TITLE}`}
                                    maxLength={32}
                                    defaultValue={DEFAULT_ROOM_TITLE}
                                />

                                <ErrorText />
                            </Field.Root>

                            <Button
                                disabled={navigation.state !== "idle"}
                                colorPalette="green"
                                type="submit"
                                name="action"
                                value="create"
                                inlineSize="full"
                            >
                                Create
                            </Button>
                        </VStack>
                    </Form>
                </PromptShell.Body>
            </PromptShell.Container>
        </PromptShell.Root>
    );
}
