import type {SchemaRules, Options} from "linkify-it";

import markedLinkifyIt from "marked-linkify-it";

const LINKIFY_SCHEMA_RULES = {} satisfies SchemaRules;

const LINKIFY_OPTIONS = {} satisfies Options & {
    tlds?: string | string[];
    tldsKeepOld?: boolean;
};

const EXTENSION_LINKIFY = markedLinkifyIt(
    LINKIFY_SCHEMA_RULES,
    LINKIFY_OPTIONS,
);

export default EXTENSION_LINKIFY;
