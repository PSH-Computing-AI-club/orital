import type {EditableValueChangeDetails, HeadingProps} from "@chakra-ui/react";
import {Editable, Heading, IconButton} from "@chakra-ui/react";

import type {ReactNode} from "react";
import {useState} from "react";

import {default as SiteTitle} from "~/components/common/title";

import CheckIcon from "~/components/icons/check_icon";
import CloseIcon from "~/components/icons/close_icon";
import EditBoxIcon from "~/components/icons/edit_box_icon";

export interface ITitleProps extends Omit<HeadingProps, "children"> {
    readonly title: string;
}

export interface ITitleTextProps extends ITitleProps {
    readonly children?: ReactNode | undefined;
}

export interface ITitleEditableProps extends ITitleProps {
    readonly disabled?: boolean;

    readonly maxLength?: number;

    readonly onTitleCommit: (details: EditableValueChangeDetails) => void;

    readonly onTitleIsValid?: (details: EditableValueChangeDetails) => boolean;
}

function TitleEditable(props: ITitleEditableProps) {
    const {
        disabled = false,
        onTitleCommit,
        onTitleIsValid,
        maxLength,
        title,
        ...rest
    } = props;

    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [isValid, setIsValid] = useState<boolean>(true);

    // **HACK:** `Editable.RootProps.value` controls the display value AND
    // the value passed to `onValueCommit`. Thereforce, we need to run a
    // virtual value state based off the change event to fake our own
    // `onTitleCommit` event.
    //
    // Yay~!
    const [value, setValue] = useState<string>(title);

    function onEditChange(details: {edit: boolean}): void {
        setIsEditing(details.edit);
    }

    function onValueChange(details: EditableValueChangeDetails): void {
        setIsValid(onTitleIsValid!(details));

        setValue(details.value);
    }

    function onValueCommit(_details: EditableValueChangeDetails): void {
        onTitleCommit({value});
    }

    return (
        <>
            <SiteTitle title={title} />

            <Heading as="h1" {...rest}>
                <Editable.Root
                    disabled={disabled}
                    value={title}
                    activationMode="dblclick"
                    submitMode={isValid ? "enter" : "none"}
                    maxLength={maxLength}
                    colorPalette={
                        isEditing ? (isValid ? undefined : "red") : undefined
                    }
                    fontSize="inherit"
                    lineHeight="inherit"
                    onEditChange={onEditChange}
                    onValueChange={onTitleIsValid ? onValueChange : undefined}
                    onValueCommit={onValueCommit}
                >
                    <Editable.Preview />
                    <Editable.Input />

                    <Editable.Control>
                        <Editable.EditTrigger asChild>
                            <IconButton variant="ghost" colorPalette="cyan">
                                <EditBoxIcon />
                            </IconButton>
                        </Editable.EditTrigger>

                        <Editable.CancelTrigger asChild>
                            <IconButton variant="outline" colorPalette="red">
                                <CloseIcon />
                            </IconButton>
                        </Editable.CancelTrigger>

                        <Editable.SubmitTrigger asChild>
                            <IconButton
                                disabled={!isValid || disabled}
                                variant="outline"
                                colorPalette="green"
                            >
                                <CheckIcon />
                            </IconButton>
                        </Editable.SubmitTrigger>
                    </Editable.Control>
                </Editable.Root>
            </Heading>
        </>
    );
}

function TitleText(props: ITitleTextProps) {
    const {children, title, ...rest} = props;

    return (
        <>
            <SiteTitle title={title} />

            <Heading as="h1" display="flex" alignItems="center" {...rest}>
                {title}
                {children}
            </Heading>
        </>
    );
}

const Title = {
    Editable: TitleEditable,
    Text: TitleText,
} as const;

export default Title;
