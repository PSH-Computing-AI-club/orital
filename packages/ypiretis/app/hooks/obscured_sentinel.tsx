import {Box} from "@chakra-ui/react";

import type {ReactElement, RefObject} from "react";
import {useEffect, useMemo, useRef, useState} from "react";

export interface IUseObscuredSentinel {
    readonly isObscured: boolean;

    readonly ObscuredSentinel: ReactElement;
}

function useIsObscured(elementRef: RefObject<HTMLElement | null>): boolean {
    const [isObscured, setIsObscured] = useState<boolean>(false);

    useEffect(() => {
        if (!elementRef.current) {
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                const [firstEntry] = entries;
                const {isIntersecting} = firstEntry;

                setIsObscured(!isIntersecting);
            },

            {
                root: null,
                rootMargin: "0px",
                threshold: 1,
            },
        );

        observer.observe(elementRef.current);

        return () => {
            observer.disconnect();
        };
    }, [elementRef]);

    return isObscured;
}

export default function useObscuredSentinel(): IUseObscuredSentinel {
    const elementRef = useRef<HTMLElement | null>(null);
    const isObscured = useIsObscured(elementRef);

    const ObscuredSentinel = useMemo(
        () => (
            <Box
                ref={elementRef}
                position="absolute"
                insetBlockStart="0"
                insetInlineStart="0"
                blockSize="1px"
                inlineSize="1px"
                aria-hidden="true"
            />
        ),
        [],
    );

    return {
        isObscured,
        ObscuredSentinel,
    };
}
