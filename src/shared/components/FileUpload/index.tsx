import * as React from 'react';
import { Upload, Icon, message, Switch, Select } from 'antd';
import { Storage, Project, NexusFile } from '@bbp/nexus-sdk-legacy';
import { StorageCommon } from '@bbp/nexus-sdk-legacy/lib/Storage/types';
import { CreateFileOptions } from '@bbp/nexus-sdk-legacy/lib/File/types';
import { labelOf } from '../../utils';
import { UploadFile } from 'antd/lib/upload/interface';

const Dragger = Upload.Dragger;

interface FileUploaderProps {
  onFileUpload: (file: File, options?: CreateFileOptions) => Promise<NexusFile>;
  makeFileLink: (nexusFile: NexusFile) => string;
  goToFile: (nexusFile: NexusFile) => void;
  project: Project;
}

interface CustomFileRequest {
  onProgress(event: { percent: number }): void;
  onError(event: Error, body?: Object): void;
  onSuccess(body: Object): void;
  data: Object;
  filename: String;
  file: File;
  withCredentials: Boolean;
  action: String;
  headers: Object;
}

const StorageMenu = ({
  orgLabel,
  projectLabel,
  onStorageSelected,
}: {
  orgLabel: string;
  projectLabel: string;
  onStorageSelected(id: string): any;
}) => {
  const [storages, setStorages] = React.useState<StorageCommon[]>([]);

  React.useEffect(() => {
    Storage.list(orgLabel, projectLabel, { deprecated: false })
      .then(data => setStorages(data._results))
      .catch(e => setStorages([]));
  }, []);

  return (
    <Select
      style={{ width: '100%' }}
      placeholder="Default storage selected"
      onChange={onStorageSelected}
    >
      {storages.map((s: StorageCommon) => (
        <Select.Option key={s['@id']} value={s['@id']}>
          {labelOf(s['@id'])}
        </Select.Option>
      ))}
    </Select>
  );
};

const FileUploader: React.FunctionComponent<FileUploaderProps> = ({
  onFileUpload,
  project,
  makeFileLink,
  goToFile,
}) => {
  const [directoryMode, setDirectoryMode] = React.useState(false);
  const [storageId, setStorageId] = React.useState<string | undefined>(
    undefined
  );
  const [recentlyUploadedFileList, setRecentlyUploadFileList] = React.useState<
    NexusFile[]
  >([]);
  const [fileList, setFileList] = React.useState<UploadFile[]>([]);

  const handleFileUpload = async (customFileRequest: CustomFileRequest) => {
    try {
      const options = storageId ? { storage: storageId } : undefined;
      const nexusFile = await onFileUpload(customFileRequest.file, options);
      setRecentlyUploadFileList([...recentlyUploadedFileList, nexusFile]);
      customFileRequest.onSuccess('Successfully uploaded file');
    } catch (error) {
      customFileRequest.onError(error);
    }
  };

  const draggerProps = {
    fileList,
    name: 'file',
    multiple: true,
    customRequest: handleFileUpload,
    onPreview(file: UploadFile) {
      const myFileIndex = fileList.findIndex(
        fileToTest => file.uid === fileToTest.uid
      );
      const recentlyUploadedFile = recentlyUploadedFileList[myFileIndex];
      if (recentlyUploadedFile) {
        goToFile(recentlyUploadedFile);
      }
    },
    onChange(info: { file: UploadFile; fileList: UploadFile[] }) {
      const { file, fileList } = info;
      const myFileIndex = fileList.findIndex(
        fileToTest => file.uid === fileToTest.uid
      );
      const recentlyUploadedFile = recentlyUploadedFileList[myFileIndex];
      if (recentlyUploadedFile) {
        fileList[myFileIndex].url = makeFileLink(recentlyUploadedFile);
      }
      const status = file.status;
      if (status !== 'uploading') {
        // do something on upload?
      }
      if (status === 'done') {
        message.success(`${file.name} file uploaded successfully.`);
      } else if (status === 'error') {
        message.error(`${file.name} file upload failed.`);
      }
      setFileList([...fileList]);
    },
  };

  return (
    <div>
      {/*
    // @ts-ignore */}
      <Dragger {...draggerProps} directory={directoryMode}>
        <p className="ant-upload-drag-icon">
          <Icon type="inbox" />
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
              <Icon type="folder-open" /> <span>Directories</span>
            </div>
          }
          unCheckedChildren={
            <div>
              <Icon type="file-add" /> <span>Single/Bulk</span>
            </div>
          }
          onChange={setDirectoryMode}
        />
      </div>
      <StorageMenu
        orgLabel={project.orgLabel}
        projectLabel={project.label}
        onStorageSelected={id => setStorageId(id)}
      />
    </div>
  );
};

export default FileUploader;
