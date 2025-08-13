// **IMPORTANT:** Do **NOT** use absolute imports in this module. It is
// imported by server-only modules.

export const NAVIGATOR_LANGUAGE = navigator.language;

export const {timeZone: NAVIGATOR_TIMEZONE} =
    Intl.DateTimeFormat().resolvedOptions();
