import * as React from 'react';
import { NexusClient } from '@bbp/nexus-sdk';
export declare const saveImage: (
  nexus: NexusClient,
  orgLabel: string,
  projectLabel: string
) => (data: ArrayBuffer) => AsyncGenerator<string, boolean, unknown>;
declare const MarkdownEditorContainer: React.FC<{
  resourceId: string;
  orgLabel: string;
  projectLabel: string;
  rev: number;
  readOnly: boolean;
  goToResource: (
    orgLabel: string,
    projectLabel: string,
    resourceId: string,
    opt: {
      revision?: number;
      tab?: string;
      expanded?: boolean;
    }
  ) => void;
}>;
export default MarkdownEditorContainer;
