import * as React from 'react';
import { Resource, PaginationSettings, NexusFile } from '@bbp/nexus-sdk';
import { Spin, notification, Empty, Card, Tabs } from 'antd';
import ResourceEditor from './ResourceEditor';
import ResourceMetadataCard from './MetadataCard';
import GraphVisualizer from '../Graph/GraphVisualizer';
import { RequestError } from '../../store/actions/utils/errors';
import LinksContainer from './Links';
import { LinksState } from '../../store/reducers/links';
import { LinkDirection } from '../../store/actions/nexus/links';

const TabPane = Tabs.TabPane;

const NEXUS_FILE_TYPE = 'File';

export interface ResourceViewProps {
  linksListPageSize: number;
  resource: Resource | null;
  error: RequestError | null;
  isFetching: boolean | false;
  onSuccess: VoidFunction;
  dotGraph: string | null;
  goToResource: (resource: Resource) => void;
  getFilePreview: (selfUrl: string) => Promise<NexusFile>;
  fetchLinks: (
    resource: Resource,
    linkDirection: LinkDirection,
    paginationSettings: PaginationSettings
  ) => void;
  fetchResource(expanded: boolean): void;
  links: LinksState | null;
}

const ResourceDetails: React.FunctionComponent<ResourceViewProps> = props => {
  const {
    linksListPageSize,
    resource,
    error,
    isFetching,
    onSuccess,
    dotGraph,
    links,
    goToResource,
    fetchLinks,
    getFilePreview,
    fetchResource,
  } = props;
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
      <Spin spinning={isFetching || busy} style={{ width: '100%' }}>
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
                  editable={!(isFile || resource.expanded)}
                  rawData={resource.expanded || resource.raw}
                  onFormatChange={fetchResource}
                  onSubmit={handleSubmit}
                  // editing={editing}
                />
              </TabPane>
              <TabPane tab="Links" key="2">
                <LinksContainer
                  getFilePreview={getFilePreview}
                  resource={resource}
                  goToResource={goToResource}
                  fetchLinks={fetchLinks}
                  links={links}
                  linksListPageSize={linksListPageSize}
                />
              </TabPane>
              {dotGraph && (
                <TabPane tab="Graph" key="3">
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
