import { Resource } from '@bbp/nexus-sdk';
import * as React from 'react';
declare const ResourceViewActionsContainer: React.FC<{
  resource: Resource;
  latestResource: Resource;
  isLatest: boolean;
  orgLabel: string;
  projectLabel: string;
}>;
export default ResourceViewActionsContainer;
