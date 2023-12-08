import { Spin } from 'antd';
import { clsx } from 'clsx';
import codemirror from 'codemirror';
import 'codemirror/addon/lint/lint.css';
import 'codemirror/addon/lint/lint.js';
import 'codemirror/mode/javascript/javascript'; // Ensure you have the JavaScript mode
import React, { forwardRef } from 'react';
import { UnControlled as CodeMirror } from 'react-codemirror2';
import { INDENT_UNIT, highlightUrlOverlay } from './editorUtils';

// Custom Linter Function
const customLinter = (text: string) => {
  const found: {
    message: string;
    severity: string;
  }[] = [];
  const lines = text.split('\n');

  lines.forEach((line, index) => {
    // Regex to find a field name with an underscore
    const regex = /"([^"]*_[^"]*)"\s*:/g;

    if (line ? line.match(regex) : false) {
      found.push({
        message: 'Field name contains an underscore',
        severity: 'warning',
      });
    }
  });

  console.log('ISSUES FOUND: ' + found.length);
  return found;
};

type TCodeEditor = {
  busy: boolean;
  value: string;
  editable: boolean;
  fullscreen: boolean;
  keyFoldCode(cm: any): void;
  handleChange(editor: any, data: any, value: any): void;
};
type TEditorConfiguration = codemirror.EditorConfiguration & {
  foldCode: boolean;
};

const CodeEditor = forwardRef<codemirror.Editor | undefined, TCodeEditor>(
  ({ busy, value, editable, fullscreen, keyFoldCode, handleChange }, ref) => {
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
              lint: customLinter, // Enable custom linter
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
