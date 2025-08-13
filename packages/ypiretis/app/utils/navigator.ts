// **IMPORTANT:** Do **NOT** use absolute imports in this module. It is
// imported by server-only modules.

export const {language: NAVIGATOR_LANGUAGE = "en-US"} = navigator;

export const {timeZone: NAVIGATOR_TIMEZONE} =
    Intl.DateTimeFormat().resolvedOptions();
