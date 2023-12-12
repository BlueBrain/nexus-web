import { Spin } from 'antd';
import { clsx } from 'clsx';
import { customLinter, LinterIssue } from './customLinter';
import codemirror from 'codemirror';
import 'codemirror/addon/lint/lint.css';
import 'codemirror/addon/lint/lint.js';
import 'codemirror/mode/javascript/javascript'; // Ensure you have the JavaScript mode
import React, { forwardRef, useCallback, useRef } from 'react';
import { UnControlled as CodeMirror } from 'react-codemirror2';
import { INDENT_UNIT, highlightUrlOverlay } from './editorUtils';

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
    const handleLintErrors = useCallback((text: string) => {
      const linterErrors = customLinter(text);
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
          onChange={handleChange}
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
