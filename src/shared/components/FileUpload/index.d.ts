import * as React from 'react';
import { NexusFile, Storage } from '@bbp/nexus-sdk';
interface FileUploaderProps {
  onFileUpload: (file: File, storageId?: string) => Promise<NexusFile>;
  makeFileLink: (nexusFile: NexusFile) => string;
  goToFile: (nexusFile: NexusFile) => void;
  orgLabel: string;
  projectLabel: string;
  storages: Storage[];
  showStorageMenu?: boolean;
}
export declare const StorageMenu: ({
  onStorageSelected,
  storages,
}: {
  orgLabel: string;
  projectLabel: string;
  storages: Storage[];
  onStorageSelected(id: string): any;
}) => JSX.Element;
declare const FileUploader: React.FunctionComponent<FileUploaderProps>;
export default FileUploader;
