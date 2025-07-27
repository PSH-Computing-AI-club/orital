import {basename, normalize} from "node:path";

import {ulid} from "ulid";

const EXPRESSION_ALLOWED_CHARACTERS = /[^a-zA-Z0-9._-]/g;

const MAXIMUM_FILE_NAME_LENGTH = 256;

export function sanitizeBasename(file_path: string): string {
    const fileName = normalize(basename(file_path));
    const sanitizedFileName = fileName.replace(
        EXPRESSION_ALLOWED_CHARACTERS,
        "_",
    );

    if (
        sanitizedFileName === "" ||
        sanitizedFileName === "." ||
        sanitizedFileName === ".."
    ) {
        return ulid();
    }

    return sanitizedFileName.substring(0, MAXIMUM_FILE_NAME_LENGTH);
}
