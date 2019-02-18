import * as React from 'react';
import { Resource } from '@bbp/nexus-sdk';
import { Spin, Button, notification, Icon } from 'antd';
import './ResourceDetails.less';
import ResourceEditor from './ResourceEditor';

export interface ResourceViewProps {
  resource: Resource | null;
  error: Error | null;
  isFetching: boolean | false;
  onSuccess: VoidFunction;
}

const ResourceDetails: React.FunctionComponent<ResourceViewProps> = props => {
  const { resource, error, isFetching, onSuccess } = props;
  const [editing, setEditing] = React.useState(false);
  const [busy, setFormBusy] = React.useState(isFetching);

  const handleSubmit = async (value: any) => {
    if (resource) {
      try {
        setFormBusy(true);
        console.log(resource);
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

  return (
    <div className="resource-details" style={{ width: '100%' }}>
      <Spin spinning={busy} style={{ width: '100%' }}>
        {!!resource && (
          <ResourceEditor
            rawData={{
              context: resource.context,
              type: resource.type,
              ...resource.data,
            }}
            onSubmit={handleSubmit}
            editing={editing}
          />
        )}
      </Spin>
    </div>
  );
};

export default ResourceDetails;
