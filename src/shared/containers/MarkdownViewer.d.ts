import * as React from 'react';
import { NexusClient } from '@bbp/nexus-sdk';
export declare const requestNexusImage: (
  nexus: NexusClient,
  image: HTMLImageElement
) => Promise<void>;
declare const MarkdownViewerContainer: React.FC<{
  template: string;
  data: object;
}>;
export default MarkdownViewerContainer;
