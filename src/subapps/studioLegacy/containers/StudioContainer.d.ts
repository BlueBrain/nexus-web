import * as React from 'react';
import { Resource } from '@bbp/nexus-sdk';
export declare type StudioResource = Resource<{
  label: string;
  description?: string;
  workspaces: [string];
  plugins?: {
    customise: boolean;
    plugins: {
      key: string;
      expanded: boolean;
    }[];
  };
}>;
declare const StudioContainer: React.FunctionComponent;
export default StudioContainer;
