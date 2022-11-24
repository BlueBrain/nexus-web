import * as React from 'react';
export declare type StorageData = {
  maxFileSize?: number;
  capacity?: number;
  files: number;
  spaceUsed: number;
  '@id': string;
};
declare const StoragesContainer: React.FC<{
  orgLabel: string;
  projectLabel: string;
}>;
export default StoragesContainer;
