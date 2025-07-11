import PLAINTEXT_MARKED from "./configurations/plaintext_marked";
import WEB_MARKED from "./configurations/web_marked";

import santizeHTML from "./sanitize";

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
