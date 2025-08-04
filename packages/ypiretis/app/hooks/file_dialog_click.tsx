import type {ChangeEventHandler, RefObject} from "react";
import {useCallback, useEffect, useRef} from "react";

interface IUseFileDialogClickProps {
    readonly ref: RefObject<HTMLElement | null>;

    readonly handleFileInput: (files: FileList) => void;
}

export default function useFileDialogClick(props: IUseFileDialogClickProps) {
    const {handleFileInput, ref: clickableRef} = props;

    const inputRef = useRef<HTMLInputElement | null>(null);

    const onElementClick = useCallback(() => {
        inputRef.current?.click();
    }, [inputRef]);

    const onInputChange = useCallback(
        ((event) => {
            const {files} = event.target;

            if (files && files.length > 0) {
                handleFileInput(files);
            }

            event.target.value = "";
        }) satisfies ChangeEventHandler<HTMLInputElement>,
        [handleFileInput],
    );

    useEffect(() => {
        const element = clickableRef.current;

        if (!element) {
            return;
        }

        element.addEventListener("click", onElementClick);

        return () => {
            element.removeEventListener("click", onElementClick);
        };
    }, [clickableRef, onElementClick]);

    return (
        <input
            ref={inputRef}
            type="file"
            multiple
            hidden
            onChange={onInputChange}
        />
    );
}
