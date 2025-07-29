import {platform} from "node:os";

const SYSTEM_PLATFORM = platform();

export const IS_LINUX = SYSTEM_PLATFORM === "linux";

export const IS_MACOS = SYSTEM_PLATFORM === "darwin";

export const IS_WINDOWS = SYSTEM_PLATFORM === "win32";
