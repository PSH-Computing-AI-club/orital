import type {Options as MarkedPlaintifyOptions} from "marked-plaintify";
import markedPlaintify from "marked-plaintify";

const PLAINTIFY_OPTIONS = {} satisfies MarkedPlaintifyOptions;

const EXTENSION_PLAINTIFY = markedPlaintify(PLAINTIFY_OPTIONS);

export default EXTENSION_PLAINTIFY;
