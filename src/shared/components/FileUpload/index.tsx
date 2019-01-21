import * as React from 'react';
import { Upload, Icon, message, Switch } from 'antd';
import { connect } from 'react-redux';
import { RootState } from '../../store/reducers';

const Dragger = Upload.Dragger;

interface FileUploaderProps {
  onFileUpload: (file: any) => Promise<any>;
}

const FileUploader: React.FunctionComponent<FileUploaderProps> = ({
  onFileUpload,
}) => {
  const [directoryMode, setDirectoryMode] = React.useState(false);
  const draggerProps = {
    name: 'file',
    multiple: true,
    customRequest: onFileUpload,
    onPreview: (file: any) => {
      // do something on click
    },
    onChange(info: any) {
      const status = info.file.status;
      if (status !== 'uploading') {
        console.log(info.file, info.fileList);
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
      <Switch
        checkedChildren={<Icon type="folder-open" />}
        unCheckedChildren={<Icon type="file-add" />}
        onChange={setDirectoryMode}
      />
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
    </div>
  );
};

const mapStateToProps = (state: RootState) => ({});

const mapDispatchToProps = (dispatch: any) => ({});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(FileUploader);
