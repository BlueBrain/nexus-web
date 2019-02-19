import * as React from 'react';
import { Resource } from '@bbp/nexus-sdk';
import { Spin, notification, Empty, Card } from 'antd';
import ResourceEditor from './ResourceEditor';
import ResourceMetadataCard from './MetadataCard';

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
        await resource.update(value);
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
  console.log(resource && { raw: resource.raw });

  return (
    <div className="resource-details" style={{ width: '100%' }}>
      <Spin spinning={busy} style={{ width: '100%' }}>
        {!!error && (
          <div style={{}}>
            <Card>
              <Empty
                description={'There was a problem loading this resource...'}
              />
            </Card>
          </div>
        )}
        {!!resource && !error && (
          <>
            <ResourceMetadataCard {...resource} />
            <ResourceEditor
              rawData={{
                context: resource.context,
                type: resource.type,
                ...resource.data,
              }}
              onSubmit={handleSubmit}
              editing={editing}
            />
          </>
        )}
      </Spin>
    </div>
  );
};

export default ResourceDetails;
