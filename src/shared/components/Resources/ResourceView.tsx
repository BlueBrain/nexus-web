import * as React from 'react';
import { Resource } from '@bbp/nexus-sdk';
import { Spin, Button, notification, Icon } from 'antd';
import ResourceMetadataCard from './MetaData';
import { UnControlled as CodeMirror } from 'react-codemirror2';
import './ResourceEditor.less';

if (typeof window !== 'undefined') {
  require('codemirror/mode/javascript/javascript');
}

export interface ResourceViewProps {
  resource: Resource | null;
  error: Error | null;
  isFetching: boolean | false;
  onSuccess: VoidFunction;
}

const ResourceView: React.FunctionComponent<ResourceViewProps> = props => {
  const { resource, error, isFetching, onSuccess } = props;
  const [editing, setEditing] = React.useState(false);
  const [busy, setFormBusy] = React.useState(isFetching);
  const [valid, setValid] = React.useState(true);
  const [value, setValue] = React.useState(
    resource && {
      context: resource.context,
      type: resource.type,
      ...resource.data,
    }
  );

  const handleSubmit = async () => {
    if (resource) {
      try {
        setFormBusy(true);
        await resource.update({
          context: resource.context,
          ...value,
        });
        notification.success({
          message: 'Resource saved',
          description: resource.name,
          duration: 2,
        });
        onSuccess();
        setFormBusy(false);
        setEditing(false);
      } catch (error) {
        notification.error({
          message: 'An unknown error occurred',
          description: error.message,
          duration: 0,
        });
        setFormBusy(false);
      }
    }
  };

  const handleChange = (editor: any, data: any, value: any) => {
    try {
      setValue(JSON.parse(value));
      setEditing(true);
      setValid(true);
    } catch (error) {
      setValid(false);
    }
  };

  return (
    <div className="resource" style={{ width: '100%' }}>
      <Spin spinning={busy} style={{ width: '100%' }}>
        {!!resource && (
          <>
            <ResourceMetadataCard {...{ ...resource, name: resource.name }} />
            <div
              className={valid ? 'resource-editor' : 'resource-editor _invalid'}
            >
              <div className="control-panel">
                <div>
                  {!editing && (
                    <div className="feedback">Directly edit this resource</div>
                  )}
                  {editing && valid && (
                    <div className="feedback _positive">
                      <Icon type="check-circle" /> Valid
                    </div>
                  )}
                  {editing && !valid && (
                    <div className="feedback _negative">
                      <Icon type="exclamation-circle" /> Invalid JSON-LD
                    </div>
                  )}
                </div>
                <div className="controls">
                  {editing && valid && (
                    <Button
                      icon="save"
                      type="primary"
                      size="small"
                      onClick={handleSubmit}
                    >
                      Save
                    </Button>
                  )}
                </div>
              </div>

              <CodeMirror
                value={JSON.stringify(
                  {
                    '@context': resource.context,
                    '@type': resource.type,
                    ...resource.data,
                  },
                  null,
                  2
                )}
                options={{
                  mode: { name: 'javascript', json: true },
                  theme: 'base16-light',
                  lineNumbers: true,
                  viewportMargin: Infinity,
                }}
                onChange={handleChange}
              />
            </div>
          </>
        )}
      </Spin>
    </div>
  );
};

export default ResourceView;
