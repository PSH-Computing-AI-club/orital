import MARKED from "./marked";
import santizeHTML from "./sanitize";

export async function renderMarkdown(text: string): Promise<string> {
    const htmlOutput = await MARKED.parse(text);

    return santizeHTML(htmlOutput);
}
