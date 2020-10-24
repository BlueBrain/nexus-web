import * as React from 'react';
import { Upload, message, Switch, Select, notification } from 'antd';
import {
  InboxOutlined,
  FolderOpenOutlined,
  FileAddOutlined,
} from '@ant-design/icons';
import { UploadFile, RcCustomRequestOptions } from 'antd/lib/upload/interface';
import { NexusFile, Storage } from '@bbp/nexus-sdk';

import { labelOf } from '../../utils';

const Dragger = Upload.Dragger;

interface FileUploaderProps {
  onFileUpload: (file: File, storageId?: string) => Promise<NexusFile>;
  makeFileLink: (nexusFile: NexusFile) => string;
  goToFile: (nexusFile: NexusFile) => void;
  orgLabel: string;
  projectLabel: string;
  storages: Storage[];
}

const StorageMenu = ({
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

const FileUploader: React.FunctionComponent<FileUploaderProps> = ({
  onFileUpload,
  orgLabel,
  projectLabel,
  makeFileLink,
  goToFile,
  storages,
}) => {
  const [directoryMode, setDirectoryMode] = React.useState(false);
  const [storageId, setStorageId] = React.useState<string | undefined>(
    undefined
  );
  const [fileIndex, setFileIndex] = React.useState<{
    [uid: string]: NexusFile;
  }>({});
  const [fileList, setFileList] = React.useState<UploadFile[]>([]);

  const handleFileUpload = (customFileRequest: RcCustomRequestOptions) => {
    onFileUpload(customFileRequest.file, storageId)
      .then((nexusFile: NexusFile) => {
        setFileIndex({
          ...fileIndex,
          [(customFileRequest.file as File & { uid: string }).uid]: nexusFile,
        });
        customFileRequest.onSuccess(
          { message: 'Successfully uploaded file' },
          customFileRequest.file
        );
      })
      .catch((error: Error) => {
        customFileRequest.onError(error);
        notification.error({
          message: `Could not upload file ${customFileRequest.file.name}`,
          description: error.message,
        });
      });
  };

  const draggerProps = {
    fileList,
    name: 'file',
    multiple: true,
    customRequest: handleFileUpload,
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
        message.success(`${file.name} file uploaded successfully.`);
      }
      setFileList([...fileList]);
    },
  };

  return (
    <div>
      <Dragger {...draggerProps} directory={directoryMode}>
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">
          Click or drag file to this area to upload
        </p>
        {directoryMode ? (
          <p className="ant-upload-hint">Upload an entire directory.</p>
        ) : (
          <p className="ant-upload-hint">Single or bulk upload.</p>
        )}
      </Dragger>
      <div
        style={{ display: 'flex', flexDirection: 'column', margin: '0.5em 0' }}
      >
        <Switch
          checkedChildren={
            <div>
              <FolderOpenOutlined /> <span>Directories</span>
            </div>
          }
          unCheckedChildren={
            <div>
              <FileAddOutlined /> <span>Single/Bulk</span>
            </div>
          }
          onChange={setDirectoryMode}
        />
      </div>
      <StorageMenu
        storages={storages}
        orgLabel={orgLabel}
        projectLabel={projectLabel}
        onStorageSelected={id => setStorageId(id)}
      />
    </div>
  );
};

export default FileUploader;
