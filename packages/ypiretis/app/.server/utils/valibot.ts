import {mkdirSync} from "node:fs";
import {dirname, isAbsolute, resolve} from "node:path";
import {cwd} from "node:process";

import {Temporal} from "@js-temporal/polyfill";

import bytes from "bytes";

import {CronPattern} from "croner";

import * as v from "valibot";

import {IS_WINDOWS} from "./platform";
import makeSecret from "./secret";

const PROCESS_CWD = cwd();

// SOURCE: https://github.com/fabian-hiller/valibot/issues/894#issuecomment-2763071920
export const EXPRESSION_DOMAIN =
    /^(?!-)([a-z0-9-]{1,63}(?<!-)\.)+[a-z]{2,36}$/iu;

// SOURCE: https://rgxdb.com/r/MD2234J
export const EXPRESSION_DURATION =
    /^(-?)P(?=\d|T\d)(?:(\d+)Y)?(?:(\d+)M)?(?:(\d+)([DW]))?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d+)?)S)?)?$/;

const EXPRESSION_NTFS_ABSOLUTE_PATH =
    /^(?:[a-zA-Z]:\\|\\\\[a-zA-Z0-9_.-]+\\[a-zA-Z0-9_.-]+)\\?(?:[^<>:"/\\|?*]+\\?)*$/;

const EXPRESSION_NTFS_RELATIVE_PATH =
    /^(?![a-zA-Z]:\\)(?!\\\\)(?!\\)(?!.*[:<>"|?*]).*$/;

const EXPRESSION_POSIX_ABSOLUTE_PATH = /^\/(?:[^/]+\/)*[^/]*$/;

const EXPRESSION_POSIX_RELATIVE_PATH = /^[^/]+(?:\/[^/]+)*\/?$/;

const resolvePath = v.transform((path: string) => {
    return isAbsolute(path) ? path : resolve(PROCESS_CWD, path);
});

const ntfsAbsolutePathFormat = v.regex(
    EXPRESSION_NTFS_ABSOLUTE_PATH,
    "Invalid absolute Windows file path format.",
);

const ntfsRelativePathFormat = v.regex(
    EXPRESSION_NTFS_RELATIVE_PATH,
    "Invalid relative Windows file path format.",
);

const posixAbsolutePathFormat = v.regex(
    EXPRESSION_POSIX_ABSOLUTE_PATH,
    "Invalid absolute POSIX file path format.",
);

const posixRelativePathFormat = v.regex(
    EXPRESSION_POSIX_RELATIVE_PATH,
    "Invalid relative POSIX file path format.",
);

const systemAbsolutePathFormat = IS_WINDOWS
    ? ntfsAbsolutePathFormat
    : posixAbsolutePathFormat;

const systemRelativePathFormat = IS_WINDOWS
    ? ntfsRelativePathFormat
    : posixRelativePathFormat;

export const systemPath = v.union([
    v.pipe(v.string(), v.nonEmpty(), systemAbsolutePathFormat),
    v.pipe(v.string(), v.nonEmpty(), systemRelativePathFormat),
]);

export const boolean = v.pipe(
    v.picklist(["true", "false"]),
    v.transform((value) => value === "true"),
);

export const bunFile = v.pipe(
    v.file(),
    v.transform<File, Bun.BunFile>((value) => {
        if (value instanceof File) {
            const {name} = value;

            return Bun.file(name);
        }

        return value as Bun.BunFile;
    }),
);

export const byteSize = v.pipe(
    v.string(),
    v.nonEmpty(),
    v.check((value) => {
        return !!bytes(value);
    }, "Invalid byte size format."),
    v.transform((value) => {
        return bytes(value)!;
    }),
);

export const cronExpression = v.pipe(
    v.string(),
    v.nonEmpty(),
    v.check((value) => {
        try {
            new CronPattern(value);
        } catch (_error) {
            return false;
        }

        return true;
    }, "Invalid cron expression format."),
);

export const cryptographicKey = v.pipe(
    v.string(),
    v.nonEmpty(),
    v.minBytes(32),
    v.transform((value) => makeSecret(value)),
);

export const domain = v.pipe(
    v.string(),
    v.nonEmpty(),
    v.regex(EXPRESSION_DOMAIN, "Invalid domain format."),
);

export const ipAddress = v.pipe(v.string(), v.ip());

export const directoryPath = v.pipe(
    systemPath,
    resolvePath,
    v.transform((resolvedDirectoryPath) => {
        mkdirSync(resolvedDirectoryPath, {
            recursive: true,
        });

        return resolvedDirectoryPath;
    }),
);

export const duration = v.pipe(
    v.string(),
    v.nonEmpty(),
    v.regex(EXPRESSION_DURATION, "Invalid duration format."),
    v.transform((value) => Temporal.Duration.from(value)),
);

export const filePath = v.pipe(
    systemPath,
    resolvePath,
    v.transform((resolvedFilePath) => {
        const directoryPath = dirname(resolvedFilePath);

        mkdirSync(directoryPath, {
            recursive: true,
        });

        return resolvedFilePath;
    }),
);

export const localhost = v.literal("localhost");

export const slug = v.pipe(v.string(), v.nonEmpty(), v.slug());

export const ulid = v.pipe(v.string(), v.nonEmpty(), v.ulid());

export const hostname = v.union(
    [localhost, domain, ipAddress],
    "Invalid hostname format.",
);
