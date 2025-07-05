import {Button, Field, PinInput, VStack} from "@chakra-ui/react";

import {Form, data, redirect, useActionData, useNavigation} from "react-router";

import type {ReactMaskOpts} from "react-imask";
import {useIMask} from "react-imask";

import * as v from "valibot";

import {requireAuthenticatedSession} from "~/.server/services/users_service";

import PromptShell from "~/components/shell/prompt_shell";

import {EXPRESSION_PIN, pin} from "~/utils/valibot";

import type {Route} from "./+types/rooms_.join";

const ACTION_ERROR_TYPES = {
    validation: "TYPE_VALIDATION",
} as const;

const ACTION_FORM_DATA_SCHEMA = v.object({
    action: v.pipe(v.string(), v.picklist(["join"])),

    pinDigit0: v.pipe(v.string(), v.length(1), pin),
    pinDigit1: v.pipe(v.string(), v.length(1), pin),
    pinDigit2: v.pipe(v.string(), v.length(1), pin),
    pinDigit3: v.pipe(v.string(), v.length(1), pin),
    pinDigit4: v.pipe(v.string(), v.length(1), pin),
    pinDigit5: v.pipe(v.string(), v.length(1), pin),
});

const MASK_OPTIONS = {
    mask: new RegExp(EXPRESSION_PIN.toString().slice(1, -2)),
    maxLength: 1,
} satisfies ReactMaskOpts;

interface IActionError {
    readonly error: (typeof ACTION_ERROR_TYPES)[keyof typeof ACTION_ERROR_TYPES];
}

export async function action(actionArgs: Route.ActionArgs) {
    const {request} = actionArgs;

    await requireAuthenticatedSession(request);

    const formData = await request.formData();

    const {
        output: actionData,

        success,
    } = v.safeParse(
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

    const {pinDigit0, pinDigit1, pinDigit2, pinDigit3, pinDigit4, pinDigit5} =
        actionData;
    const pin = `${pinDigit0}${pinDigit1}${pinDigit2}${pinDigit3}${pinDigit4}${pinDigit5}`;

    return redirect(`/r/${pin}`);
}

export function loader(loaderArgs: Route.LoaderArgs) {
    const {request} = loaderArgs;

    return requireAuthenticatedSession(request);
}

function ErrorText() {
    const {error} = useActionData<IActionError>() ?? {};

    switch (error) {
        case ACTION_ERROR_TYPES.validation:
            return <Field.ErrorText>Invalid room pin format.</Field.ErrorText>;
    }
}

export default function RoomsJoin(props: Route.ComponentProps) {
    const {actionData} = props;
    const {error} = actionData ?? {};

    const navigation = useNavigation();

    const {ref: maskRefDigit0} = useIMask(MASK_OPTIONS);
    const {ref: maskRefDigit1} = useIMask(MASK_OPTIONS);
    const {ref: maskRefDigit2} = useIMask(MASK_OPTIONS);
    const {ref: maskRefDigit3} = useIMask(MASK_OPTIONS);
    const {ref: maskRefDigit4} = useIMask(MASK_OPTIONS);
    const {ref: maskRefDigit5} = useIMask(MASK_OPTIONS);

    return (
        <PromptShell.Root>
            <PromptShell.Sidebar />

            <PromptShell.Container>
                <PromptShell.Title
                    title="Join a Presentation Room."
                    query="Join"
                />

                <PromptShell.Body>
                    <Form method="POST">
                        <VStack gap="4">
                            <Field.Root invalid={!!error} required>
                                <Field.Label>
                                    Room PIN
                                    <Field.RequiredIndicator />
                                </Field.Label>

                                <PinInput.Root
                                    type="alphanumeric"
                                    size="2xl"
                                    fontFamily="mono"
                                    inlineSize="full"
                                >
                                    <PinInput.Control
                                        display="flex"
                                        justifyContent="space-around"
                                    >
                                        <PinInput.Input
                                            index={0}
                                            name="pinDigit0"
                                            // @ts-expect-error - **HACK:** I am supplying the proper type but
                                            // the masking library does not like Chakra's typing.
                                            ref={maskRefDigit0}
                                        />

                                        <PinInput.Input
                                            index={1}
                                            name="pinDigit1"
                                            // @ts-expect-error - **HACK:** See above.
                                            ref={maskRefDigit1}
                                        />

                                        <PinInput.Input
                                            index={2}
                                            name="pinDigit2"
                                            // @ts-expect-error - **HACK:** See above.
                                            ref={maskRefDigit2}
                                        />

                                        <PinInput.Input
                                            index={3}
                                            name="pinDigit3"
                                            // @ts-expect-error - **HACK:** See above.
                                            ref={maskRefDigit3}
                                        />

                                        <PinInput.Input
                                            index={4}
                                            name="pinDigit4"
                                            // @ts-expect-error - **HACK:** See above.
                                            ref={maskRefDigit4}
                                        />

                                        <PinInput.Input
                                            index={5}
                                            name="pinDigit5"
                                            // @ts-expect-error - **HACK:** See above.
                                            ref={maskRefDigit5}
                                        />
                                    </PinInput.Control>
                                </PinInput.Root>

                                <ErrorText />
                            </Field.Root>

                            <Button
                                disabled={navigation.state !== "idle"}
                                colorPalette="green"
                                type="submit"
                                name="action"
                                value="join"
                                inlineSize="full"
                            >
                                Join
                            </Button>
                        </VStack>
                    </Form>
                </PromptShell.Body>
            </PromptShell.Container>
        </PromptShell.Root>
    );
}
