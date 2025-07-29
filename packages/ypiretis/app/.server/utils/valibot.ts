import {mkdir} from "node:fs/promises";
import {dirname, isAbsolute, resolve} from "node:path";
import {cwd} from "node:process";

import bytes from "bytes";

import {CronPattern} from "croner";

import * as v from "valibot";

import {IS_WINDOWS} from "./platform";

const PROCESS_CWD = cwd();

const EXPRESSION_NTFS_ABSOLUTE_PATH =
    /^(?:[a-zA-Z]:\\|\\\\[a-zA-Z0-9_.-]+\\[a-zA-Z0-9_.-]+)\\?(?:[^<>:"/\\|?*]+\\?)*$/;

const EXPRESSION_NTFS_RELATIVE_PATH =
    /^(?![a-zA-Z]:\\)(?!\\\\)(?!\\)(?!.*[:<>"|?*]).*$/;

const EXPRESSION_POSIX_ABSOLUTE_PATH = /^\/(?:[^/]+\/)*[^/]*$/;

const EXPRESSION_POSIX_RELATIVE_PATH = /^[^/]+(?:\/[^/]+)*\/?$/;

const resolvePath = v.transform((path: string) => {
    return isAbsolute(path) ? path : resolve(PROCESS_CWD, path);
});

const ntfsAbsolutePath = v.regex(
    EXPRESSION_NTFS_ABSOLUTE_PATH,
    "Invalid absolute Windows file path format.",
);

const ntfsRelativePath = v.regex(
    EXPRESSION_NTFS_RELATIVE_PATH,
    "Invalid relative Windows file path format.",
);

const posixAbsolutePath = v.regex(
    EXPRESSION_POSIX_ABSOLUTE_PATH,
    "Invalid absolute POSIX file path format.",
);

const posixRelativePath = v.regex(
    EXPRESSION_POSIX_RELATIVE_PATH,
    "Invalid relative POSIX file path format.",
);

const systemAbsolutePath = IS_WINDOWS ? ntfsAbsolutePath : posixAbsolutePath;

const systemRelativePath = IS_WINDOWS ? ntfsRelativePath : posixRelativePath;

export const systemPath = v.union([
    v.pipe(v.string(), systemAbsolutePath),
    v.pipe(v.string(), systemRelativePath),
]);

export const bunFile = v.transform<File, Bun.BunFile>((value) => {
    if (value instanceof File) {
        const {name} = value;

        return Bun.file(name);
    }

    return value as Bun.BunFile;
});

export const byteSize = v.pipe(
    v.string(),
    v.check((value) => {
        return !!bytes(value);
    }, "Invalid byte size format."),
    v.transform((value) => {
        return bytes(value)!;
    }),
);

export const cronExpression = v.pipe(
    v.string(),
    v.check((value) => {
        try {
            new CronPattern(value);
        } catch (_error) {
            return false;
        }

        return true;
    }, "Invalid cron expression format."),
);

export const directoryPath = v.pipeAsync(
    systemPath,
    resolvePath,
    v.transformAsync(async (resolvedDirectoryPath) => {
        await mkdir(resolvedDirectoryPath, {
            recursive: true,
        });

        return resolvedDirectoryPath;
    }),
);

export const filePath = v.pipeAsync(
    systemPath,
    resolvePath,
    v.transformAsync(async (resolvedFilePath) => {
        const directoryPath = dirname(resolvedFilePath);

        await mkdir(directoryPath, {
            recursive: true,
        });

        return resolvedFilePath;
    }),
);
