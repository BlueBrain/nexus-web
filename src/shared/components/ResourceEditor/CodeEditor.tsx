import 'codemirror/mode/javascript/javascript';
import 'codemirror/addon/fold/foldcode';
import 'codemirror/addon/fold/foldgutter';
import 'codemirror/addon/fold/brace-fold';

import { Spin } from 'antd';
import { clsx } from 'clsx';
import { EditorConfiguration } from 'codemirror';
import React, { forwardRef } from 'react';
import { UnControlled as CodeMirror } from 'react-codemirror2';

import { highlightUrlOverlay, INDENT_UNIT } from './editorUtils';

type TCodeEditor = {
  busy: boolean;
  value: string;
  editable: boolean;
  fullscreen: boolean;
  keyFoldCode(cm: any): void;
  handleChange(editor: any, data: any, value: any): void;
};

type TEditorConfiguration = EditorConfiguration & {
  foldCode: boolean;
};

const CodeEditor = forwardRef<CodeMirror.Editor | undefined, TCodeEditor>(
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
              gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
              lineWiseCopyCut: true,
              extraKeys: {
                'Ctrl-Q': keyFoldCode,
              },
            } as TEditorConfiguration
          }
          className={clsx('code-mirror-editor', fullscreen && 'full-screen-mode')}
          onChange={handleChange}
          editorDidMount={(editor) => {
            highlightUrlOverlay(editor);
            (ref as React.MutableRefObject<CodeMirror.Editor>).current = editor;
          }}
        />
      </Spin>
    );
  }
);

export default CodeEditor;
