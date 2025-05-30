import type {MetaFunction} from "react-router";

export function wrapMetaFunction(metaFunction: MetaFunction): MetaFunction {
    return (metaArgs) => {
        const meta = metaFunction(metaArgs);
        const {matches} = metaArgs;

        if (matches.length > 1) {
            const nextTitleMeta = (meta?.find(
                (descriptor) => "title" in descriptor,
            ) ?? null) as {title: string} | null;

            if (nextTitleMeta) {
                const previousMatch = matches[matches.length - 2];
                const previousTitleMeta = (previousMatch.meta.find(
                    (descriptor) => "title" in descriptor,
                ) ?? null) as {title: string} | null;

                if (previousTitleMeta) {
                    const remainingMeta = meta!.filter(
                        (descriptor) => !("title" in descriptor),
                    );

                    nextTitleMeta.title = `${nextTitleMeta.title} :: ${previousTitleMeta.title}`;

                    return [nextTitleMeta, ...remainingMeta];
                }
            }
        }

        return meta;
    };
}
