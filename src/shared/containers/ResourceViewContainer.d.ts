import * as React from 'react';
import { Resource } from '@bbp/nexus-sdk';
export declare type PluginMapping = {
  [pluginKey: string]: object;
};
export declare const DEFAULT_ACTIVE_TAB_KEY = '#JSON';
declare const ResourceViewContainer: React.FunctionComponent<{
  render?: (
    resource: Resource<{
      [key: string]: any;
    }> | null
  ) => React.ReactElement | null;
}>;
export default ResourceViewContainer;
