import type {MDXEditorProps} from "@mdxeditor/editor";
import {
    BlockTypeSelect,
    BoldItalicUnderlineToggles,
    CodeMirrorEditor,
    CodeToggle,
    CreateLink,
    InsertCodeBlock,
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
    linkDialogPlugin,
    linkPlugin,
    listsPlugin,
    markdownShortcutPlugin,
    quotePlugin,
    tablePlugin,
    thematicBreakPlugin,
    toolbarPlugin,
} from "@mdxeditor/editor";

import type {IProseProps} from "./prose";
import Prose from "./prose";

import "@mdxeditor/editor/style.css";
import "~/styles/markdown-editor.css";

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
                plugins={[
                    codeBlockPlugin({
                        defaultCodeBlockLanguage: "plaintext",

                        codeBlockEditorDescriptors: [
                            {
                                priority: -10,
                                match: (_) => true,
                                Editor: CodeMirrorEditor,
                            },
                        ],
                    }),

                    codeMirrorPlugin({
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
                    }),

                    headingsPlugin({
                        allowedHeadingLevels: [2, 3, 4, 5, 6],
                    }),

                    linkPlugin(),
                    linkDialogPlugin(),
                    listsPlugin(),
                    quotePlugin(),
                    tablePlugin(),
                    thematicBreakPlugin(),
                    markdownShortcutPlugin(),

                    toolbarPlugin({
                        toolbarClassName: "markdown-editor--toolbar",

                        toolbarContents() {
                            return (
                                <>
                                    <UndoRedo />
                                    <Separator />
                                    <BoldItalicUnderlineToggles />
                                    <CodeToggle />
                                    <Separator />
                                    <StrikeThroughSupSubToggles />
                                    <Separator />
                                    <ListsToggle
                                        options={["bullet", "number"]}
                                    />
                                    <Separator />
                                    <BlockTypeSelect />
                                    <Separator />
                                    <CreateLink />
                                    <Separator />
                                    <InsertTable />
                                    <InsertCodeBlock />
                                    <InsertThematicBreak />
                                </>
                            );
                        },
                    }),
                ]}
                onChange={onMarkdownChange}
            />
        </Prose>
    );
}
