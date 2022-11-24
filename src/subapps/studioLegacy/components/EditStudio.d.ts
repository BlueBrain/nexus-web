import * as React from 'react';
import { Resource } from '@bbp/nexus-sdk';
import { SaveImageHandler } from 'react-mde';
export declare type StudioResource = Resource<{
  label: string;
  description?: string;
  workspaces?: [string];
}>;
declare const EditStudio: React.FC<{
  studio: StudioResource | null;
  onSave?(
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
  onSaveImage: SaveImageHandler;
  markdownViewer: React.FC<{
    template: string;
    data: object;
  }>;
}>;
export default EditStudio;
