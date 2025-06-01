import {useEffect, useState} from "react";

import {useLocation} from "react-router";

import {useHydrated} from "remix-utils/use-hydrated";

export type IHashLoaderCallback<T> = (hash: string) => Promise<T> | T;

export default function withHashLoader<T>(
    callback: IHashLoaderCallback<T>,
): () => T | null {
    return () => {
        const hash = useLocation().hash.slice(1);
        const isHydrated = useHydrated();

        const [loaderData, setLoaderData] = useState<T | null>(null);

        useEffect(() => {
            if (!isHydrated) {
                return;
            }

            (async () => {
                const loaderData = await callback(hash);

                setLoaderData(loaderData);
            })();
        }, [hash, isHydrated]);

        return loaderData;
    };
}
