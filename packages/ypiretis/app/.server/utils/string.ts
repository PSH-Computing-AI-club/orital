const EXPRESSION_CONSECUTIVE_SPACES = /\s\s+/g;

const EXPRESSION_NEWLINE = /\n/g;

export interface ITransformToSnippetOptions {
    readonly limit: number;
}

export function transformTextToSnippet(
    text: string,
    options: ITransformToSnippetOptions,
) {
    const {limit} = options;

    const trimmedText = text
        .trim()
        .replace(EXPRESSION_NEWLINE, " ")
        .replace(EXPRESSION_CONSECUTIVE_SPACES, " ");

    if (trimmedText.length <= limit) {
        return trimmedText;
    }

    const lastSpaceIndex = trimmedText.substring(0, limit - 3).lastIndexOf(" ");
    const truncationIndex = lastSpaceIndex > 0 ? lastSpaceIndex : limit - 3;

    const truncatedText = trimmedText.substring(0, truncationIndex);

    return `${truncatedText}...`;
}
