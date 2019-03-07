import * as React from 'react';
import { Resource } from '@bbp/nexus-sdk';
import { Spin, notification, Empty, Card, Tabs } from 'antd';
import ResourceEditor from './ResourceEditor';
import ResourceMetadataCard from './MetadataCard';
import GraphVisualizer from '../Graph/GraphVisualizer';
import { RequestError } from '../../store/actions/utils/errors';

const TabPane = Tabs.TabPane;

const NEXUS_FILE_TYPE = 'File';

export interface ResourceViewProps {
  resource: Resource | null;
  error: RequestError | null;
  isFetching: boolean | false;
  onSuccess: VoidFunction;
  dotGraph: string | null;
}

const ResourceDetails: React.FunctionComponent<ResourceViewProps> = props => {
  const { resource, error, isFetching, onSuccess, dotGraph } = props;
  const [editing, setEditing] = React.useState(false);
  const [busy, setFormBusy] = React.useState(isFetching);

  // TODO move NexusFileType constant to sdk
  const isFile =
    resource && resource.type && resource.type.includes(NEXUS_FILE_TYPE);

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
            <ResourceMetadataCard {...{ ...resource, name: resource.name }} />
            <Tabs defaultActiveKey="1">
              <TabPane tab="JSON" key="1">
                <ResourceEditor
                  editable={!isFile}
                  rawData={{
                    context: resource.context,
                    type: resource.type,
                    ...resource.data,
                  }}
                  onSubmit={handleSubmit}
                  editing={editing}
                />
              </TabPane>
              {dotGraph && (
                <TabPane tab="Graph" key="2">
                  <GraphVisualizer dotGraph={dotGraph} />
                </TabPane>
              )}
            </Tabs>
          </>
        )}
      </Spin>
    </div>
  );
};

export default ResourceDetails;
