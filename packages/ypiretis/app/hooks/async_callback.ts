import {useState, useCallback} from "react";
import type {DependencyList} from "react";

export function useAsyncCallback<
    T extends (...args: any[]) => Promise<unknown>,
>(callback: T, deps: DependencyList): [boolean, T] {
    const [isRunning, setIsRunning] = useState(false);

    const memoizedCallback = useCallback(
        async (...args: Parameters<T>) => {
            setIsRunning(true);

            const ret = await callback(...args);

            setIsRunning(false);
            return ret;
        },

        // eslint-disable-next-line react-hooks/exhaustive-deps
        [callback, ...deps],
    ) as T;

    return [isRunning, memoizedCallback];
}
