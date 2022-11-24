import * as React from 'react';
import { NexusFile } from '@bbp/nexus-sdk';
declare const FileUploadContainer: React.FunctionComponent<{
  projectLabel: string;
  orgLabel: string;
  showStorageMenu?: boolean;
  onFileUploaded?: (file: NexusFile) => void;
}>;
export default FileUploadContainer;
