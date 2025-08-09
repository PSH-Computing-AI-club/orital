import type {MDXEditorProps, ToMarkdownOptions} from "@mdxeditor/editor";
import {
    BlockTypeSelect,
    BoldItalicUnderlineToggles,
    CodeMirrorEditor,
    CodeToggle,
    CreateLink,
    InsertCodeBlock,
    InsertImage,
    InsertTable,
    InsertThematicBreak,
    ListsToggle,
    MDXEditor,
    Separator,
    StrikeThroughSupSubToggles,
    UndoRedo,
    codeBlockPlugin,
    codeMirrorPlugin,
    headingsPlugin,
    imagePlugin,
    linkDialogPlugin,
    linkPlugin,
    listsPlugin,
    markdownShortcutPlugin,
    quotePlugin,
    tablePlugin,
    thematicBreakPlugin,
    toolbarPlugin,
} from "@mdxeditor/editor";

import type {IProseProps} from "~/components/common/prose";
import Prose from "~/components/common/prose";

import "@mdxeditor/editor/style.css";
import "~/styles/markdown-editor.css";

const TO_MARKDOWN_OPTIONS = {
    emphasis: "_",
} satisfies ToMarkdownOptions;

const CODE_BLOCK_PLUGIN_OPTIONS = {
    defaultCodeBlockLanguage: "plaintext",

    codeBlockEditorDescriptors: [
        {
            priority: -10,
            match: (_) => true,
            Editor: CodeMirrorEditor,
        },
    ],
} satisfies Exclude<Parameters<typeof codeBlockPlugin>[0], undefined>;

const CODE_MIRROR_PLUGIN_OPTIONS = {
    codeBlockLanguages: {
        plaintext: "Plain Text",
        cpp: "C++",
        csharp: "C#",
        css: "CSS",
        dockerfile: "Dockerfile",
        html: "HTML",
        java: "Java",
        kotlin: "Kotlin",
        php: "PHP",
        powershell: "PowerShell",
        python: "Python",
        r: "R",
        rust: "Rust",
        shell: "Shell",
        sql: "SQL",
        swift: "Swift",
        toml: "TOML",
        ts: "TypeScript",
        tsx: "TypeScript (React)",
        xml: "XML",
        yaml: "YAML",
    },
} satisfies Exclude<Parameters<typeof codeMirrorPlugin>[0], undefined>;

const HEADINGS_PLUGIN_OPTIONS = {
    allowedHeadingLevels: [2, 3, 4, 5, 6],
} satisfies Exclude<Parameters<typeof headingsPlugin>[0], undefined>;

const TOOLBAR_PLUGIN_CONTENTS = (() => {
    return (
        <>
            <UndoRedo />
            <Separator />
            <BoldItalicUnderlineToggles />
            <CodeToggle />
            <Separator />
            <StrikeThroughSupSubToggles />
            <Separator />
            <ListsToggle options={["bullet", "number"]} />
            <Separator />
            <BlockTypeSelect />
            <Separator />
            <CreateLink />
            <InsertImage />
            <Separator />
            <InsertTable />
            <InsertCodeBlock />
            <InsertThematicBreak />
        </>
    );
}) satisfies Exclude<
    Parameters<typeof toolbarPlugin>[0],
    undefined
>["toolbarContents"];

export type IChangeCallback = MDXEditorProps["onChange"];

export interface IMarkdownEditorProps extends IProseProps {
    readonly markdown?: string;

    readonly onMarkdownChange?: IChangeCallback;
}

export default function MarkdownEditor(props: IMarkdownEditorProps) {
    const {markdown = "", onMarkdownChange, ...rest} = props;

    return (
        <Prose
            borderColor="border"
            borderStyle="solid"
            borderWidth="thin"
            {...rest}
        >
            <MDXEditor
                className="markdown-editor"
                contentEditableClassName="markdown-editor--content-editable"
                markdown={markdown}
                toMarkdownOptions={TO_MARKDOWN_OPTIONS}
                plugins={[
                    codeBlockPlugin(CODE_BLOCK_PLUGIN_OPTIONS),
                    codeMirrorPlugin(CODE_MIRROR_PLUGIN_OPTIONS),
                    headingsPlugin(HEADINGS_PLUGIN_OPTIONS),
                    linkPlugin(),
                    linkDialogPlugin(),
                    listsPlugin(),
                    quotePlugin(),

                    imagePlugin({
                        disableImageResize: true,
                    }),

                    tablePlugin(),
                    thematicBreakPlugin(),
                    markdownShortcutPlugin(),

                    toolbarPlugin({
                        toolbarClassName: "markdown-editor--toolbar",
                        toolbarContents: TOOLBAR_PLUGIN_CONTENTS,
                    }),
                ]}
                onChange={onMarkdownChange}
            />
        </Prose>
    );
}
