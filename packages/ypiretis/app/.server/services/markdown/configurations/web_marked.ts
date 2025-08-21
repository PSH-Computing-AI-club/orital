import type {MarkedOptions} from "marked";
import {Marked} from "marked";

import EXTENSION_EMOJI from "../extensions/emoji";
import EXTENSION_GFM_HEADING_ID from "../extensions/gfm_heading_id";
import EXTENSION_LINKIFY from "../extensions/linkify_it";
import EXTENSION_SHIKI from "../extensions/shiki";

const MARKED_OPTIONS = {
    gfm: true,
} satisfies MarkedOptions;

const WEB_MARKED = new Marked();

WEB_MARKED.options(MARKED_OPTIONS)
    .use(EXTENSION_GFM_HEADING_ID)
    .use(EXTENSION_EMOJI)
    .use(EXTENSION_SHIKI)
    .use(EXTENSION_LINKIFY);

export default WEB_MARKED;
