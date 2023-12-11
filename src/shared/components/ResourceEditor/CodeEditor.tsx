import { Spin } from 'antd';
import { clsx } from 'clsx';
import codemirror from 'codemirror';
import 'codemirror/addon/lint/lint.css';
import 'codemirror/addon/lint/lint.js';
import 'codemirror/mode/javascript/javascript'; // Ensure you have the JavaScript mode
import React, { forwardRef } from 'react';
import { UnControlled as CodeMirror } from 'react-codemirror2';
import { INDENT_UNIT, highlightUrlOverlay } from './editorUtils';

const customLinter = (
  text: string,
  onLintError: (hasError: boolean) => void
) => {
  const found: {
    message: string;
    severity: string;
  }[] = [];
  const lines = text.split('\n');

  // TODO Only check the current updated line to improve performance
  lines.forEach(line => {
    // Regex to find a field name with an underscore
    const regex = /"([^"]*_[^"]*)"\s*:/g;

    if (line ? line.match(regex) : false) {
      found.push({
        message: 'Field name contains an underscore',
        severity: 'warning',
      });
    }
  });

  const hasError = found.length > 0;
  onLintError(hasError);
  return found;
};

type TCodeEditor = {
  busy: boolean;
  value: string;
  editable: boolean;
  fullscreen: boolean;
  keyFoldCode(cm: any): void;
  handleChange(editor: any, data: any, value: any): void;
  onLintError?: (hasError: boolean) => void;
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
                getAnnotations: (text: string) => {
                  return customLinter(text, onLintError || (() => {}));
                },
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
