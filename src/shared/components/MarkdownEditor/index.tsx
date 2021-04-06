import * as React from 'react';
import ReactMde, { SaveImageHandler } from 'react-mde';
import { Button, Spin } from 'antd';
import { CloseCircleOutlined, SaveOutlined } from '@ant-design/icons';
import { Resource } from '@bbp/nexus-sdk';

import 'react-mde/lib/styles/css/react-mde-all.css';

const MarkdownEditorComponent: React.FC<{
  resource: Resource;
  loading: boolean;
  readOnly: boolean;
  onSaveImage?: SaveImageHandler;
  onSave?: (value: string) => void;
  markdownViewer: React.FC<{
    template: string;
    data: object;
  }>;
}> = ({
  resource,
  loading,
  readOnly,
  onSaveImage,
  onSave,
  markdownViewer: MarkdownViewer,
}) => {
  const [value, setValue] = React.useState(resource?.description);
  const [selectedTab, setSelectedTab] = React.useState<'write' | 'preview'>(
    'write'
  );

  const handleSave = () => {
    onSave && value && value !== resource.description && onSave(value);
  };

  const handleCancel = () => {
    setValue(resource?.description);
  };

  return (
    <div>
      <ReactMde
        loadingPreview={<Spin spinning={loading} />}
        value={value}
        onChange={setValue}
        selectedTab={selectedTab}
        onTabChange={setSelectedTab}
        generateMarkdownPreview={async markdown => (
          <MarkdownViewer template={markdown} data={resource} />
        )}
        readOnly={readOnly}
        paste={
          onSaveImage && {
            saveImage: onSaveImage,
          }
        }
      />
      <div style={{ padding: '1em 0' }}>
        <Button
          disabled={selectedTab === 'preview'}
          type="primary"
          loading={loading}
          icon={<SaveOutlined />}
          onClick={handleSave}
          style={{ marginRight: '1em' }}
        >
          Save
        </Button>
        <Button
          disabled={selectedTab === 'preview'}
          icon={<CloseCircleOutlined />}
          onClick={handleCancel}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
};

export const MarkdownEditorFormItemComponent: React.FC<{
  value?: string;
  resource: Resource;
  onChange?: (value: string) => void;
  onSaveImage: SaveImageHandler;
  markdownViewer: React.FC<{
    template: string;
    data: object;
  }>;
}> = ({
  value,
  resource,
  onChange,
  onSaveImage,
  markdownViewer: MarkdownViewer,
}) => {
  const [selectedTab, setSelectedTab] = React.useState<'write' | 'preview'>(
    'write'
  );

  const handleChange = (description: string) => {
    onChange && onChange(description);
  };

  return (
    <div>
      <ReactMde
        value={value || ''}
        onChange={handleChange}
        selectedTab={selectedTab}
        onTabChange={setSelectedTab}
        generateMarkdownPreview={async markdown =>
          !!value && <MarkdownViewer template={markdown} data={resource} />
        }
        paste={{
          saveImage: onSaveImage,
        }}
      />
    </div>
  );
};

export default MarkdownEditorComponent;
