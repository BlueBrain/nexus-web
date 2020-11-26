import * as React from 'react';
import ReactMde, { SaveImageHandler } from 'react-mde';
import Handlebars from 'handlebars';
import * as Showdown from 'showdown';
import { Button, Spin } from 'antd';
import { CloseCircleOutlined, SaveOutlined } from '@ant-design/icons';
import { Resource } from '@bbp/nexus-sdk';

import 'react-mde/lib/styles/css/react-mde-all.css';

const converter = new Showdown.Converter({
  tables: true,
  simplifiedAutoLink: true,
  strikethrough: true,
  tasklists: true,
});

const MarkdownEditorComponent: React.FC<{
  resource: Resource;
  loading: boolean;
  readOnly: boolean;
  onSaveImage?: SaveImageHandler;
  onSave?: (value: string) => void;
}> = ({ resource, loading, readOnly, onSaveImage, onSave }) => {
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
        generateMarkdownPreview={async markdown =>
          converter.makeHtml(Handlebars.compile(markdown)(resource))
        }
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

export default MarkdownEditorComponent;
