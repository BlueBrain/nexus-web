import * as React from 'react';
import { Resource } from '@bbp/nexus-sdk';
declare const ResourcePlugins: React.FunctionComponent<{
  resource?: Resource;
  goToResource?: (selfURL: string) => void;
  empty?: React.ReactElement;
  openPlugins: string[];
  studioDefinedPluginsToInclude?: string[];
  builtInPlugins: {
    key: string;
    name: string;
    pluginComponent: React.FC;
  }[];
  handleCollapseChange: (pluginName: string) => void;
}>;
export default ResourcePlugins;
