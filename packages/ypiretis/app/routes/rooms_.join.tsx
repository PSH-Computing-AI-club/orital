import {Button, Field, PinInput, VStack} from "@chakra-ui/react";

import {Form, data, redirect, useNavigation} from "react-router";

import {withMask} from "use-mask-input";

import * as v from "valibot";

import {requireAuthenticatedSession} from "~/.server/services/users_service";

import PromptShell from "~/components/shell/prompt_shell";

import {EXPRESSION_PIN, pin} from "~/utils/valibot";

import type {Route} from "./+types/rooms_.join";

const pinWithMask = withMask("pinDigit", {
    mask: "",
    regex: EXPRESSION_PIN.toString().slice(1, -2),
    placeholder: "_",
    casing: "upper",
});

const ACTION_FORM_DATA_SCHEMA = v.object({
    action: v.pipe(v.string(), v.picklist(["join"])),

    pin0: v.pipe(v.string(), v.length(1), pin),
    pin1: v.pipe(v.string(), v.length(1), pin),
    pin2: v.pipe(v.string(), v.length(1), pin),
    pin3: v.pipe(v.string(), v.length(1), pin),
    pin4: v.pipe(v.string(), v.length(1), pin),
    pin5: v.pipe(v.string(), v.length(1), pin),
});

export async function action(actionArgs: Route.ActionArgs) {
    const {request} = actionArgs;

    await requireAuthenticatedSession(request);

    const formData = await request.formData();

    const {
        output: actionData,
        issues,
        success,
    } = v.safeParse(
        ACTION_FORM_DATA_SCHEMA,
        Object.fromEntries(formData.entries()),
    );

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

    const {pin0, pin1, pin2, pin3, pin4, pin5} = actionData;
    const pin = `${pin0}${pin1}${pin2}${pin3}${pin4}${pin5}`;

    return redirect(`/r/${pin}`);
}

export function loader(loaderArgs: Route.LoaderArgs) {
    const {request} = loaderArgs;

    return requireAuthenticatedSession(request);
}

export default function RoomsJoin(props: Route.ComponentProps) {
    const {actionData} = props;
    const {errors} = actionData ?? {};

    const navigation = useNavigation();

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
                            <Field.Root invalid={!!errors} required>
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
                                            name="pin0"
                                            ref={pinWithMask}
                                        />

                                        <PinInput.Input
                                            index={1}
                                            name="pin1"
                                            ref={pinWithMask}
                                        />

                                        <PinInput.Input
                                            index={2}
                                            name="pin2"
                                            ref={pinWithMask}
                                        />

                                        <PinInput.Input
                                            index={3}
                                            name="pin3"
                                            ref={pinWithMask}
                                        />

                                        <PinInput.Input
                                            index={4}
                                            name="pin4"
                                            ref={pinWithMask}
                                        />

                                        <PinInput.Input
                                            index={5}
                                            name="pin5"
                                            ref={pinWithMask}
                                        />
                                    </PinInput.Control>
                                </PinInput.Root>

                                {
                                    // **NOTE:** This is not that great... but meh...
                                    // it is the more straight-forward way.
                                }

                                {errors?.pin0 ? (
                                    <Field.ErrorText>
                                        [digit 1] {errors.pin0[0]}
                                    </Field.ErrorText>
                                ) : null}

                                {errors?.pin1 ? (
                                    <Field.ErrorText>
                                        [digit 2] {errors.pin1[0]}
                                    </Field.ErrorText>
                                ) : null}

                                {errors?.pin2 ? (
                                    <Field.ErrorText>
                                        [digit 3] {errors.pin2[0]}
                                    </Field.ErrorText>
                                ) : null}

                                {errors?.pin3 ? (
                                    <Field.ErrorText>
                                        [digit 4] {errors.pin3[0]}
                                    </Field.ErrorText>
                                ) : null}

                                {errors?.pin4 ? (
                                    <Field.ErrorText>
                                        [digit 5] {errors.pin4[0]}
                                    </Field.ErrorText>
                                ) : null}

                                {errors?.pin5 ? (
                                    <Field.ErrorText>
                                        [digit 6] {errors.pin5[0]}
                                    </Field.ErrorText>
                                ) : null}
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
