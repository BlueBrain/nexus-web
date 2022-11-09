import * as React from 'react';
import { Upload, Button, message, Select, Typography } from 'antd';
import { FileImageOutlined } from '@ant-design/icons';
import { UploadFile } from 'antd/lib/upload/interface';
import { NexusFile, Storage } from '@bbp/nexus-sdk';

import { labelOf } from '../../utils';
import useNotification from '../../hooks/useNotification';

interface FileUpdaterProps {
  onFileUpdate: (file: File, storageId?: string) => Promise<NexusFile>;
  makeFileLink: (nexusFile: NexusFile) => string;
  goToFile: (nexusFile: NexusFile) => void;
  assetId: string;
  orgLabel: string;
  projectLabel: string;
  storages: Storage[];
  showStorageMenu?: boolean;
}

const { Text } = Typography;

export const StorageMenu = ({
  onStorageSelected,
  storages,
}: {
  orgLabel: string;
  projectLabel: string;
  storages: Storage[];
  onStorageSelected(id: string): any;
}) => {
  return (
    <Select
      style={{ width: '100%' }}
      placeholder="Default storage selected"
      onChange={onStorageSelected}
    >
      {storages.map((s: Storage) => (
        <Select.Option key={s['@id']} value={s['@id']}>
          {labelOf(s['@id'])}
        </Select.Option>
      ))}
    </Select>
  );
};

const FileUpdater: React.FunctionComponent<FileUpdaterProps> = ({
  onFileUpdate,
  orgLabel,
  projectLabel,
  makeFileLink,
  goToFile,
  storages,
  showStorageMenu,
  assetId,
}) => {
  const [directoryMode, setDirectoryMode] = React.useState(false);
  const [storageId, setStorageId] = React.useState<string | undefined>(
    undefined
  );
  const [fileIndex, setFileIndex] = React.useState<{
    [uid: string]: NexusFile;
  }>({});
  const [fileList, setFileList] = React.useState<UploadFile[]>([]);
  const notification = useNotification();
  console.log(assetId);

  const handleFileUpdate = (customFileRequest: any) => {
    console.log('handling file update custom request', customFileRequest);
    onFileUpdate(customFileRequest.file)
      .then((nexusFile: NexusFile) => {
        console.log('handling file update', nexusFile);
        setFileIndex({
          ...fileIndex,
          [(customFileRequest.file as File & { uid: string }).uid]: nexusFile,
        });
        customFileRequest.onSuccess(
          { message: 'Successfully UPDATED file' },
          customFileRequest.file
        );
      })
      .catch((error: Error) => {
        customFileRequest.onError(error);
        notification.error({
          message: `Could not UPDATE file ${customFileRequest.file.name}`,
          description: error.message,
        });
      });
  };

  const uploadProps = {
    fileList,
    name: 'file',
    customRequest: handleFileUpdate,
    onPreview(file: UploadFile) {
      const nexusFile = fileIndex[file.uid];
      if (nexusFile) {
        goToFile(nexusFile);
      }
    },
    onChange(info: { file: UploadFile; fileList: UploadFile[] }) {
      const { file, fileList } = info;
      const status = file.status;
      const nexusFile = fileIndex[file.uid];
      if (nexusFile) {
        file.url = makeFileLink(nexusFile);
      }
      if (status === 'done') {
        message.success(`${file.name} file updateed successfully.`);
      }
      setFileList([...fileList]);
    },
  };

  return (
    <div>
      <Upload {...uploadProps} directory={directoryMode}>
        <Button aria-label="Edit name and description" className="button-blend">
          <FileImageOutlined />
        </Button>
      </Upload>
    </div>
  );
};

export default FileUpdater;
