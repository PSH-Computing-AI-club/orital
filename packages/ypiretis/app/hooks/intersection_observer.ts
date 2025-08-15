import type {RefObject} from "react";
import {useEffect} from "react";

export type IUseIntersectionObserverCallback = IntersectionObserverCallback;

export interface IUseIntersectionObserverOptions
    extends IntersectionObserverInit {}

export default function useIntersectionObserver(
    elementRef: RefObject<HTMLElement | null>,
    callback: IUseIntersectionObserverCallback,
    options: IUseIntersectionObserverOptions,
): void {
    useEffect(() => {
        const node = elementRef?.current;

        if (!node) {
            return;
        }

        const observer = new IntersectionObserver(callback, options);

        observer.observe(node);

        return () => {
            observer.disconnect();
        };
    }, [callback, elementRef, options]);
}
