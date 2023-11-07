import React, { forwardRef, useRef } from 'react';
import { EditorConfiguration } from 'codemirror';
import { UnControlled as CodeMirror } from 'react-codemirror2';
import { INDENT_UNIT, highlightUrlOverlay } from './editorUtils';
import { clsx } from 'clsx';
import { Spin } from 'antd';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/addon/fold/foldcode';
import 'codemirror/addon/fold/foldgutter';
import 'codemirror/addon/fold/brace-fold';

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
    const wrapperRef = useRef(null);
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
          className={clsx(
            'code-mirror-editor',
            fullscreen && 'full-screen-mode'
          )}
          ref={wrapperRef}
          onChange={handleChange}
          editorDidMount={editor => {
            highlightUrlOverlay(editor);
            (ref as React.MutableRefObject<CodeMirror.Editor>).current = editor;
          }}
          editorWillUnmount={() => {
            const editor = (ref as React.MutableRefObject<
              CodeMirror.Editor
            >).current.getWrapperElement();
            if (editor) editor.remove();
            if (wrapperRef.current)
              (wrapperRef.current as { hydrated: boolean }).hydrated = false;
          }}
        />
      </Spin>
    );
  }
);

export default CodeEditor;
