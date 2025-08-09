import type {Options} from "prettier";
import {format} from "prettier";

import PLAINTEXT_MARKED from "./configurations/plaintext_marked";
import WEB_MARKED from "./configurations/web_marked";

import santizeHTML from "./sanitize";

const PRETTIER_OPTIONS = {
    parser: "markdown",

    arrowParens: "always",
    bracketSpacing: false,
    endOfLine: "lf",
    printWidth: 80,
    proseWrap: "preserve",
    semi: true,
    singleQuote: false,
    tabWidth: 4,
    useTabs: false,
} satisfies Options;

export function formatMarkdown(text: string): Promise<string> {
    return format(text, PRETTIER_OPTIONS);
}

export async function renderMarkdownForWeb(text: string): Promise<string> {
    const htmlOutput = await WEB_MARKED.parse(text);

    return santizeHTML(htmlOutput);
}

export async function renderMarkdownForPlaintext(
    text: string,
): Promise<string> {
    const plaintextOutput = await PLAINTEXT_MARKED.parse(text);

    return plaintextOutput;
}
