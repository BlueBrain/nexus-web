import * as React from 'react';
import { Upload, Icon, message, Switch, Select } from 'antd';
import { Storage, Project } from '@bbp/nexus-sdk-legacy';
import { StorageCommon } from '@bbp/nexus-sdk-legacy/lib/Storage/types';
import { CreateFileOptions } from '@bbp/nexus-sdk-legacy/lib/File/types';
import { labelOf } from '../../utils';

const Dragger = Upload.Dragger;

interface FileUploaderProps {
  onFileUpload: (file: File, options?: CreateFileOptions) => void;
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
      style={{ width: 250 }}
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
}) => {
  const [directoryMode, setDirectoryMode] = React.useState(false);
  const [storageId, setStorageId] = React.useState<string | undefined>(
    undefined
  );

  const handleFileUpload = async (customFileRequest: CustomFileRequest) => {
    try {
      const options = storageId ? { storage: storageId } : undefined;
      await onFileUpload(customFileRequest.file, options);
      customFileRequest.onSuccess('Successfully uploaded file');
    } catch (error) {
      customFileRequest.onError(error);
    }
  };

  const draggerProps = {
    name: 'file',
    multiple: true,
    customRequest: handleFileUpload,
    onPreview: (file: any) => {
      // TODO do something on click, like show resource Edit / Inspect View
    },
    onChange(info: any) {
      const status = info.file.status;
      if (status !== 'uploading') {
        // do something on upload?
      }
      if (status === 'done') {
        message.success(`${info.file.name} file uploaded successfully.`);
      } else if (status === 'error') {
        message.error(`${info.file.name} file upload failed.`);
      }
    },
  };

  return (
    <div>
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
