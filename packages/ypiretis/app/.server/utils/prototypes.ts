import type {UnionToIntersection} from "./types";

export function combine<T extends object[]>(
    ...objects: T
): UnionToIntersection<T[number]> {
    const combinedDescriptors = objects.map((object) => {
        return Object.getOwnPropertyDescriptors(object);
    });

    const mergedDescriptors = Object.assign({}, ...combinedDescriptors);

    return Object.defineProperties(
        {},
        mergedDescriptors,
    ) as UnionToIntersection<T[number]>;
}

export function extend<T extends object[]>(...mixins: T) {
    type I = UnionToIntersection<T[number]>;

    return <U extends object>(extension: U & ThisType<I & U>): I & U => {
        return combine(...mixins, extension) as I & U;
    };
}
