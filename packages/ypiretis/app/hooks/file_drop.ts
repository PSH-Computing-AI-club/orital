import type {RefObject} from "react";
import {useCallback, useEffect, useState} from "react";

export interface IUseFileDropOptions {
    readonly ref: RefObject<HTMLElement | null>;

    readonly handleFileDrop: (files: FileList) => void;
}

export default function useFileDrop(options: IUseFileDropOptions): boolean {
    const {ref, handleFileDrop} = options;

    const [isDraggedOver, setIsDraggedOver] = useState(false);

    const onDragOver = useCallback(
        (event: DragEvent) => {
            event.preventDefault();
            event.stopPropagation();

            setIsDraggedOver(true);
        },

        [setIsDraggedOver],
    );

    const onDragLeave = useCallback(
        (event: DragEvent) => {
            event.preventDefault();
            event.stopPropagation();

            setIsDraggedOver(false);
        },

        [setIsDraggedOver],
    );

    const onDrop = useCallback(
        (event: DragEvent) => {
            event.preventDefault();
            event.stopPropagation();

            setIsDraggedOver(false);

            const {files} = event.dataTransfer ?? {};

            if (files && files.length > 0) {
                handleFileDrop(files);
            }
        },

        [handleFileDrop],
    );

    useEffect(() => {
        const element = ref.current;

        if (!element) {
            return;
        }

        element.addEventListener("dragover", onDragOver);
        element.addEventListener("dragleave", onDragLeave);
        element.addEventListener("drop", onDrop);

        return () => {
            element.removeEventListener("dragover", onDragOver);
            element.removeEventListener("dragleave", onDragLeave);
            element.removeEventListener("drop", onDrop);
        };
    }, [ref, onDragOver, onDragLeave, onDrop]);

    return isDraggedOver;
}
