import type {MarkedEmojiOptions} from "marked-emoji";
import {markedEmoji} from "marked-emoji";

import EMOJI_DB from "./emoji.db";

const EMOJI_OPTIONS = {
    emojis: EMOJI_DB,

    renderer: (token) => token.emoji,
} satisfies MarkedEmojiOptions<(typeof EMOJI_DB)[keyof typeof EMOJI_DB]>;

const EXTENSION_EMOJI = markedEmoji(EMOJI_OPTIONS);

export default EXTENSION_EMOJI;
