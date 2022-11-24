import * as React from 'react';
import { ResourceLink, Resource } from '@bbp/nexus-sdk';
import './ResourceLinkItem.less';
export declare type ResourceLinkAugmented = ResourceLink &
  Resource & {
    isRevisionSpecific: boolean;
    originalLinkID: string;
  };
declare const ResourceLinkItem: React.FunctionComponent<{
  link: ResourceLinkAugmented;
  onInternalClick?: (internalLink: ResourceLinkAugmented) => void;
}>;
export default ResourceLinkItem;
