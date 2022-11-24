import * as React from 'react';
import { Resource } from '@bbp/nexus-sdk';
import { SaveImageHandler } from 'react-mde';
import './StudioEditorForm.less';
declare type StudioResource = Resource<{
  label: string;
  description?: string;
  workspaces?: [string];
  plugins?: {
    customise: boolean;
    plugins: {
      key: string;
      name: string;
      expanded: boolean;
    }[];
  };
}>;
declare const StudioEditorForm: React.FC<{
  saveStudio?(
    label: string,
    description?: string,
    plugins?: {
      customise: boolean;
      plugins: {
        key: string;
        expanded: boolean;
      }[];
    }
  ): void;
  studio?: StudioResource | null;
  onSaveImage: SaveImageHandler;
  markdownViewer: React.FC<{
    template: string;
    data: object;
  }>;
}>;
export default StudioEditorForm;
