import { Spin } from 'antd';
import { clsx } from 'clsx';
import { customLinter, LinterIssue } from './customLinter'; // Adjust the import path as necessary
import codemirror from 'codemirror';
import 'codemirror/addon/lint/lint.css';
import 'codemirror/addon/lint/lint.js';
import 'codemirror/mode/javascript/javascript'; // Ensure you have the JavaScript mode
import React, { forwardRef, useCallback, useRef, useState } from 'react';
import { UnControlled as CodeMirror } from 'react-codemirror2';
import { INDENT_UNIT, highlightUrlOverlay } from './editorUtils';

interface Change {
  from: CodeMirror.Position;
  to: CodeMirror.Position;
  text: string[];
}

interface ChangedLineInfo {
  lineNumber: number;
  content: string;
}

type ChangeData = {
  changes?: Change[];
};

type EditorType = {
  lineCount: () => number;
  getLine: (line: number) => string;
};

type TCodeEditor = {
  busy: boolean;
  value: string;
  editable: boolean;
  fullscreen: boolean;
  keyFoldCode(cm: any): void;
  handleChange(editor: any, data: any, value: any): void;
  onLintError?: (errors: LinterIssue[]) => void;
};

type TEditorConfiguration = codemirror.EditorConfiguration & {
  foldCode: boolean;
  lint?: boolean | any;
};

const CodeEditor = forwardRef<codemirror.Editor | undefined, TCodeEditor>(
  (
    {
      busy,
      value,
      editable,
      fullscreen,
      keyFoldCode,
      handleChange,
      onLintError,
    },
    ref
  ) => {
    const prevLinterErrorsRef = useRef<LinterIssue[]>([]);

    const handleEditorChange = (editor: any, data: any, value: any) => {
      handleChange(editor, data, value);

      // Extract changed lines and their content
      const changedLinesInfo = extractChangedLines(editor, data);
      const linterErrors = customLinter(changedLinesInfo);

      if (
        JSON.stringify(linterErrors) !==
        JSON.stringify(prevLinterErrorsRef.current)
      ) {
        onLintError?.(linterErrors);
        prevLinterErrorsRef.current = linterErrors;
      }
    };

    const extractChangedLines = (
      editor: EditorType,
      changeData: ChangeData | Change
    ): ChangedLineInfo[] => {
      // Convert changeData to an array of changes
      const changes = ('changes' in changeData
        ? changeData.changes
        : [changeData]) as Change[];
      let changedLinesInfo: ChangedLineInfo[] = [];

      changes.forEach(change => {
        const startLine = change.from.line;
        const endLine = change.to.line;

        for (let i = startLine; i <= endLine; i += 1) {
          if (i < editor.lineCount()) {
            const lineContent = editor.getLine(i);
            changedLinesInfo.push({ lineNumber: i, content: lineContent });
          }
        }
      });

      // Remove duplicates
      changedLinesInfo = changedLinesInfo.reduce((unique, item) => {
        if (!unique.some(obj => obj.lineNumber === item.lineNumber)) {
          unique.push(item);
        }
        return unique;
      }, [] as ChangedLineInfo[]); // Make sure to initialize the array with the correct type

      return changedLinesInfo;
    };

    const handleLintErrors = useCallback((text: string) => {
      // Split the text by new lines to get an array of lines
      const lines = text.split('\n');

      // Create an array of ChangedLineInfo objects
      const changedLines: ChangedLineInfo[] = lines.map((content, index) => ({
        content,
        lineNumber: index + 1, // Line numbers typically start at 1, not 0
      }));

      // Call customLinter with the array of ChangedLineInfo objects
      const linterErrors = customLinter(changedLines);

      if (
        JSON.stringify(linterErrors) !==
        JSON.stringify(prevLinterErrorsRef.current)
      ) {
        onLintError?.(linterErrors);
        prevLinterErrorsRef.current = linterErrors;
      }

      return linterErrors;
    }, []);

    return (
      <Spin spinning={busy}>
        <CodeMirror
          data-testid="code-mirror-editor"
          value={value}
          autoCursor={false}
          detach={false}
          options={
            {
              readOnly: !editable,
              mode: { name: 'javascript', json: true },
              theme: 'base16-light',
              lineNumbers: true,
              lineWrapping: true,
              viewportMargin: Infinity,
              foldGutter: true,
              foldCode: true,
              indentUnit: INDENT_UNIT,
              gutters: [
                'CodeMirror-linenumbers',
                'CodeMirror-foldgutter',
                'CodeMirror-lint-markers',
              ],
              lineWiseCopyCut: true,
              extraKeys: {
                'Ctrl-Q': keyFoldCode,
              },
              lint: {
                getAnnotations: handleLintErrors,
                async: true,
              },
            } as TEditorConfiguration
          }
          className={clsx(
            'code-mirror-editor',
            fullscreen && 'full-screen-mode'
          )}
          onChange={handleEditorChange}
          editorDidMount={editor => {
            highlightUrlOverlay(editor);
            (ref as React.MutableRefObject<codemirror.Editor>).current = editor;
          }}
        />
      </Spin>
    );
  }
);

export default CodeEditor;
