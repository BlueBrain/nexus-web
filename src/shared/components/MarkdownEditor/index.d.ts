import * as React from 'react';
import { SaveImageHandler } from 'react-mde';
import { Resource } from '@bbp/nexus-sdk';
import 'react-mde/lib/styles/css/react-mde-all.css';
declare const MarkdownEditorComponent: React.FC<{
  resource: Resource;
  loading: boolean;
  readOnly: boolean;
  onSaveImage?: SaveImageHandler;
  onSave?: (value: string) => void;
  onCancel?: () => void;
  markdownViewer: React.FC<{
    template: string;
    data: object;
  }>;
}>;
export declare const MarkdownEditorFormItemComponent: React.FC<{
  value?: string;
  resource: Resource;
  onChange?: (value: string) => void;
  onSaveImage: SaveImageHandler;
  markdownViewer: React.FC<{
    template: string;
    data: object;
  }>;
}>;
export default MarkdownEditorComponent;
