import * as React from 'react';
import { ResourceLinkAugmented } from './ResourceLinkItem';
declare const ResourceLinks: React.FunctionComponent<{
  busy: boolean;
  error: Error | null;
  links: ResourceLinkAugmented[];
  total: number;
  onLoadMore: () => void;
  onClick?: (link: ResourceLinkAugmented) => void;
}>;
export default ResourceLinks;
