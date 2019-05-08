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
import Helmet from 'react-helmet';

const TabPane = Tabs.TabPane;

const NEXUS_FILE_TYPE = 'File';

export interface ResourceViewProps {
  linksListPageSize: number;
  resource: Resource | null;
  error: RequestError | null;
  isFetching: boolean | false;
  onSuccess: VoidFunction;
  dotGraph: string | null;
  goToOrg: (resource: Resource) => void;
  goToProject: (resource: Resource) => void;
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
    goToOrg,
    goToProject,
    goToResource,
    fetchLinks,
    getFilePreview,
    fetchResource,
  } = props;
  const [busy, setFormBusy] = React.useState(isFetching);
  const [expanded, setExpanded] = React.useState(false);

  React.useEffect(() => {
    if (resource && expanded && !resource.expanded) {
      fetchResource(expanded);
    }
  }, [expanded]);

  // TODO move NexusFileType constant to sdk
  const isFile =
    resource && resource.type && resource.type.includes(NEXUS_FILE_TYPE);

  const handleFormatChange = () => {
    setExpanded(!expanded);
  };

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
            <Helmet
              title={`${resource.name} | ${resource.projectLabel} | ${
                resource.orgLabel
              } | Nexus Web`}
              meta={[
                // TODO find good ideas for descriptions!
                {
                  name: 'description',
                  content: `
                    ${resource.name}
                  `,
                },
              ]}
            />
            <h1 className="name">
              <span>
                <a onClick={() => goToOrg(resource)}>{resource.orgLabel}</a> |{' '}
                <a onClick={() => goToProject(resource)}>
                  {resource.projectLabel}
                </a>{' '}
                |{' '}
              </span>
              {resource.name}
            </h1>
            <ResourceMetadataCard
              {...{ resource, getFilePreview, showPreview: true }}
            />
            <Tabs defaultActiveKey="1">
              <TabPane tab="JSON" key="1">
                <ResourceEditor
                  expanded={expanded}
                  editable={!isFile || !!resource.expanded}
                  rawData={
                    expanded && resource.expanded
                      ? resource.expanded
                      : resource.raw
                  }
                  onFormatChange={handleFormatChange}
                  onSubmit={handleSubmit}
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
