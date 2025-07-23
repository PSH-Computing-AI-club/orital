import markedShiki from "marked-shiki";

import {createHighlighter} from "shiki";

import {
    transformerNotationDiff,
    transformerNotationHighlight,
    transformerNotationWordHighlight,
    transformerNotationFocus,
    transformerNotationErrorLevel,
    transformerMetaHighlight,
    transformerMetaWordHighlight,
} from "@shikijs/transformers";

const SHIKI_HIGHLIGHTER = await createHighlighter({
    themes: ["github-dark"],

    langs: [
        "batch",
        "c#",
        "c++",
        "c",
        "cmake",
        "cmd",
        "cpp",
        "console",
        "csharp",
        "cs",
        "css",
        "csv",
        "diff",
        "docker",
        "dockerfile",
        "dotenv",
        "erb",
        "go",
        "html",
        "ini",
        "java",
        "javascript",
        "js",
        "json",
        "json5",
        "jsonc",
        "jsonl",
        "jsx",
        "kotlin",
        "latex",
        "lua",
        "makefile",
        "markdown",
        "md",
        "objc",
        "objective-c",
        "objective-cpp",
        "perl",
        "php",
        "plaintext",
        "properties",
        "proto",
        "protobuf",
        "powershell",
        "py",
        "python",
        "r",
        "raku",
        "rb",
        "ruby",
        "rust",
        "sh",
        "shell",
        "sql",
        "swift",
        "text",
        "toml",
        "ts",
        "tsx",
        "typescript",
        "typst",
        "xml",
        "yaml",
        "yml",
    ],
});

const EXTENSION_SHIKI = markedShiki({
    highlight(code, lang, props) {
        return SHIKI_HIGHLIGHTER.codeToHtml(code, {
            lang,

            theme: "github-dark",
            meta: {__raw: props.join(" ")},

            transformers: [
                transformerNotationDiff({
                    matchAlgorithm: "v3",
                }),

                transformerNotationHighlight({
                    matchAlgorithm: "v3",
                }),

                transformerNotationWordHighlight({
                    matchAlgorithm: "v3",
                }),

                transformerNotationFocus({
                    matchAlgorithm: "v3",
                }),

                transformerNotationErrorLevel({
                    matchAlgorithm: "v3",
                }),

                transformerMetaHighlight(),
                transformerMetaWordHighlight(),
            ],
        });
    },
});

export default EXTENSION_SHIKI;
