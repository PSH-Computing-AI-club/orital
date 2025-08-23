import {slug as slugify} from "github-slugger";

const EXPRESSION_CONSECUTIVE_DASHES = /-{2,}/g;

export function toSlug(text: string): string {
    return slugify(text, false).replace(EXPRESSION_CONSECUTIVE_DASHES, "-");
}
