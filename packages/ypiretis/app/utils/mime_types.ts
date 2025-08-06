import ArchiveIcon from "~/components/icons/archive_icon";
import ArticleIcon from "~/components/icons/article_icon";
import FileIcon from "~/components/icons/file_icon";
import ImageIcon from "~/components/icons/image_icon";
import MovieIcon from "~/components/icons/movie_icon";
import MusicIcon from "~/components/icons/music_icon";
import NoteIcon from "~/components/icons/note_icon";
import ScriptTextIcon from "~/components/icons/script_text_icon";
import TableIcon from "~/components/icons/table_icon";

const ICON_MIME_TYPE_MAP = {
    archive: ArchiveIcon,
    audio: MusicIcon,
    data: TableIcon,
    document: ArticleIcon,
    image: ImageIcon,
    programmingLanuage: ScriptTextIcon,
    miscellaneous: FileIcon,
    text: NoteIcon,
    video: MovieIcon,
} as const;

export type IIconMimeTypeComponents =
    (typeof ICON_MIME_TYPE_MAP)[keyof typeof ICON_MIME_TYPE_MAP];

export function determineMimeTypeIcon(
    mimeType: string,
): IIconMimeTypeComponents {
    mimeType = mimeType.toLowerCase();

    if (
        mimeType.includes("application/x-bzip") ||
        mimeType.includes("application/x-bzip2") ||
        mimeType.includes("application/gzip") ||
        mimeType.includes("application/vnd.rar") ||
        mimeType.includes("application/x-7z-compressed") ||
        mimeType.includes("application/x-gzip") ||
        mimeType.includes("application/x-tar") ||
        mimeType.includes("application/x-zip-compressed") ||
        mimeType.includes("application/zip")
    ) {
        return ICON_MIME_TYPE_MAP.archive;
    } else if (
        mimeType.includes("audio/aac") ||
        mimeType.includes("audio/flac") ||
        mimeType.includes("audio/midi") ||
        mimeType.includes("audio/mp3") ||
        mimeType.includes("audio/mpeg") ||
        mimeType.includes("audio/ogg") ||
        mimeType.includes("audio/wav") ||
        mimeType.includes("audio/weba") ||
        mimeType.includes("audio/x-midi") ||
        mimeType.includes("audio/x-wav")
    ) {
        return ICON_MIME_TYPE_MAP.audio;
    } else if (
        mimeType.includes("application/json") ||
        mimeType.includes("application/xml") ||
        mimeType.includes("application/vnd.ms-excel") ||
        mimeType.includes("application/vnd.oasis.opendocument.chart") ||
        mimeType.includes("application/vnd.oasis.opendocument.formula") ||
        mimeType.includes("application/vnd.oasis.opendocument.database") ||
        mimeType.includes("application/vnd.oasis.opendocument.spreadsheet") ||
        mimeType.includes(
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        ) ||
        mimeType.includes("text/csv") ||
        mimeType.includes("text/xml")
    ) {
        return ICON_MIME_TYPE_MAP.data;
    } else if (
        mimeType.includes("application/epub+zip") ||
        mimeType.includes("application/msword") ||
        mimeType.includes("application/pdf") ||
        mimeType.includes("application/rtf") ||
        mimeType.includes("application/vnd.ms-powerpoint") ||
        mimeType.includes("application/vnd.oasis.opendocument.graphics") ||
        mimeType.includes("application/vnd.oasis.opendocument.presentation") ||
        mimeType.includes("application/vnd.oasis.opendocument.text") ||
        mimeType.includes(
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ) ||
        mimeType.includes(
            "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        ) ||
        mimeType.includes("application/vnd.visio") ||
        mimeType.includes("text/markdown") ||
        mimeType.includes("text/x-markdown")
    ) {
        return ICON_MIME_TYPE_MAP.document;
    } else if (
        mimeType.includes("application/vnd.oasis.opendocument.image") ||
        mimeType.includes("image/apng") ||
        mimeType.includes("image/avif") ||
        mimeType.includes("image/bmp") ||
        mimeType.includes("image/heic") ||
        mimeType.includes("image/jpeg") ||
        mimeType.includes("image/jpg") ||
        mimeType.includes("image/png") ||
        mimeType.includes("image/gif") ||
        mimeType.includes("image/svg+xml") ||
        mimeType.includes("image/tiff") ||
        mimeType.includes("image/vnd.microsoft.icon") ||
        mimeType.includes("image/webp")
    ) {
        return ICON_MIME_TYPE_MAP.image;
    } else if (
        mimeType.includes("application/javascript") ||
        mimeType.includes("application/sql") ||
        mimeType.includes("application/xhtml+xml") ||
        mimeType.includes("application/x-httpd-php") ||
        mimeType.includes("application/x-sh") ||
        mimeType.includes("application/x-sql") ||
        mimeType.includes("text/css") ||
        mimeType.includes("text/html") ||
        mimeType.includes("text/javascript")
    ) {
        return ICON_MIME_TYPE_MAP.programmingLanuage;
    } else if (mimeType.includes("text/plain")) {
        return ICON_MIME_TYPE_MAP.text;
    } else if (
        mimeType.includes("video/mp4") ||
        mimeType.includes("video/mpeg") ||
        mimeType.includes("video/ogg") ||
        mimeType.includes("video/quicktime") ||
        mimeType.includes("video/webm") ||
        mimeType.includes("video/x-msvideo")
    ) {
        return ICON_MIME_TYPE_MAP.video;
    } else if (
        mimeType.includes("font/ttf") ||
        mimeType.includes("font/woff") ||
        mimeType.includes("font/woff2") ||
        mimeType.includes("font/x-font-opentype") ||
        mimeType.includes("font/x-ttf") ||
        mimeType.includes("font/x-woff") ||
        mimeType.includes("font/x-woff2")
    ) {
        return ICON_MIME_TYPE_MAP.miscellaneous;
    } else {
        return ICON_MIME_TYPE_MAP.miscellaneous;
    }
}
