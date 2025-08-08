const DEFAULT_TRUNCATION_ELLIPSIS = "...";

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
