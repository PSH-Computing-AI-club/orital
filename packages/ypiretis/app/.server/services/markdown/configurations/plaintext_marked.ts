import type {MarkedOptions} from "marked";
import {Marked} from "marked";

import EXTENSION_EMOJI from "../extensions/emoji";
import EXTENSION_PLAINTIFY from "../extensions/plaintify";

const MARKED_OPTIONS = {
    gfm: true,
} satisfies MarkedOptions;

const PLAINTEXT_MARKED = new Marked();

PLAINTEXT_MARKED.options(MARKED_OPTIONS)
    .use(EXTENSION_EMOJI)
    .use(EXTENSION_PLAINTIFY);

export default PLAINTEXT_MARKED;
