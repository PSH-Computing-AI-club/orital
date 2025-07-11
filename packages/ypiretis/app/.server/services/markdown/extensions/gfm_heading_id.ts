import type {GfmHeadingIdOptions} from "marked-gfm-heading-id";
import {gfmHeadingId} from "marked-gfm-heading-id";

const GFM_HEADING_ID_OPTIONS = {
    prefix: "",
} satisfies GfmHeadingIdOptions;

const EXTENSION_GFM_HEADING_ID = gfmHeadingId(GFM_HEADING_ID_OPTIONS);

export default EXTENSION_GFM_HEADING_ID;
