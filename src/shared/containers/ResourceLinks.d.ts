import * as React from 'react';
import { ResourceLinkAugmented } from '../components/ResourceLinks/ResourceLinkItem';
declare const ResourceLinksContainer: React.FunctionComponent<{
  resourceId: string;
  orgLabel: string;
  projectLabel: string;
  rev: number;
  direction: 'incoming' | 'outgoing';
  onClick?: (link: ResourceLinkAugmented) => void;
}>;
export default ResourceLinksContainer;
