import React, { forwardRef } from 'react';
import codemiror, { EditorConfiguration } from 'codemirror';
import { UnControlled as CodeMirror } from 'react-codemirror2';
import { INDENT_UNIT } from '.';
import { clsx } from 'clsx';
import { Spin } from 'antd';

type TCodeEditor = {
  busy: boolean;
  value: string;
  editable: boolean;
  loadingResolution: boolean;
  fullscreen: boolean;
  keyFoldCode(cm: any): void;
  handleChange(editor: any, data: any, value: any): void;
  onLinkClick(_: any, ev: MouseEvent): void;
  onLinksFound(): void;
};
type TEditorConfiguration = EditorConfiguration & {
  foldCode: boolean;
};

const CodeEditor = forwardRef<codemiror.Editor | undefined, TCodeEditor>(
  (
    {
      busy,
      value,
      editable,
      fullscreen,
      keyFoldCode,
      loadingResolution,
      handleChange,
      onLinkClick,
      onLinksFound,
    },
    ref
  ) => {
    return (
      <Spin spinning={busy}>
        <CodeMirror
          data-testId="code-mirror-editor"
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
              extraKeys: {
                'Ctrl-Q': keyFoldCode,
              },
            } as TEditorConfiguration
          }
          className={clsx(
            'code-mirror-editor',
            loadingResolution && 'resolution-on-progress',
            fullscreen && 'full-screen-mode'
          )}
          onChange={handleChange}
          editorDidMount={editor => {
            (ref as React.MutableRefObject<codemiror.Editor>).current = editor;
          }}
          onMouseDown={onLinkClick}
          onUpdate={onLinksFound}
        />
      </Spin>
    );
  }
);

export default CodeEditor;
