import * as React from 'react';
import { Upload, Icon, message, Switch } from 'antd';
import { NexusFile } from '@bbp/nexus-sdk';

const Dragger = Upload.Dragger;

interface FileUploaderProps {
  onFileUpload: (file: File) => void;
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

const FileUploader: React.FunctionComponent<FileUploaderProps> = ({
  onFileUpload,
}) => {
  const [directoryMode, setDirectoryMode] = React.useState(false);

  const handleFileUpload = async (customFileRequest: CustomFileRequest) => {
    try {
      await onFileUpload(customFileRequest.file);
      customFileRequest.onSuccess('Successfully uploaded file');
    } catch (error) {
      console.error(error);
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
    </div>
  );
};

export default FileUploader;
