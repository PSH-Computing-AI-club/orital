import DOMPurify from "dompurify";

import {JSDOM} from "jsdom";

const {window: JSDOM_WINDOW} = new JSDOM("");

const DOMPUIRFY_CLEANER = DOMPurify(JSDOM_WINDOW);

export default function santizeHTML(html: string): string {
    return DOMPUIRFY_CLEANER.sanitize(html);
}
