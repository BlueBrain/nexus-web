import * as React from 'react';
import { Resource, NexusClient } from '@bbp/nexus-sdk';
declare const Preview: React.FC<{
  resource: Resource;
  nexus: NexusClient;
  collapsed: boolean;
  handleCollapseChanged: () => void;
}>;
export default Preview;
