const DEFAULT_TRUNCATION_ELLIPSIS = "...";

const EXPRESSION_CONSECUTIVE_SPACES = /\s\s+/g;

const EXPRESSION_NEWLINE = /\n/g;

export function normalizeSpacing(text: string): string {
    return text
        .trim()
        .replace(EXPRESSION_NEWLINE, " ")
        .replace(EXPRESSION_CONSECUTIVE_SPACES, " ");
}

export function truncateTextMiddle(
    text: string,
    maxLength: number,
    ellipsis: string = DEFAULT_TRUNCATION_ELLIPSIS,
): string {
    if (text.length <= maxLength) {
        return text;
    }

    if (maxLength <= ellipsis.length) {
        return ellipsis.slice(0, maxLength);
    }

    const preservedCharacters = maxLength - ellipsis.length;

    const leftCharacters = Math.ceil(preservedCharacters / 2);
    const rightCharacters = Math.floor(preservedCharacters / 2);

    const leftSlice = text.slice(0, leftCharacters);
    const rightSlice = text.slice(text.length - rightCharacters);

    return leftSlice + ellipsis + rightSlice;
}

export function truncateTextRight(
    text: string,
    maxLength: number,
    ellipsis: string = DEFAULT_TRUNCATION_ELLIPSIS,
): string {
    if (text.length <= maxLength) {
        return text;
    }

    if (maxLength <= ellipsis.length) {
        return ellipsis.slice(0, maxLength);
    }

    const preservedCharacters = maxLength - ellipsis.length;

    return text.slice(0, preservedCharacters) + ellipsis;
}
