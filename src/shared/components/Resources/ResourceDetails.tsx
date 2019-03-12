import * as React from 'react';
import { Resource, PaginatedList } from '@bbp/nexus-sdk';
import { Spin, notification, Empty, Card, Tabs } from 'antd';
import ResourceEditor from './ResourceEditor';
import ResourceMetadataCard from './MetadataCard';
import GraphVisualizer from '../Graph/GraphVisualizer';
import { RequestError } from '../../store/actions/utils/errors';
import AnimatedList from '../Animations/AnimatedList';
import { ResourceLink } from '@bbp/nexus-sdk/lib/Resource/types';
import ResourceListItem from './ResourceItem';
import { titleOf } from '../../utils';
import Item from 'antd/lib/list/Item';

const TabPane = Tabs.TabPane;

const NEXUS_FILE_TYPE = 'File';

export interface ResourceViewProps {
  resource: Resource | null;
  error: RequestError | null;
  isFetching: boolean | false;
  onSuccess: VoidFunction;
  dotGraph: string | null;
  goToResource: (resource: Resource) => void;
  links: {
    incoming: PaginatedList<ResourceLink>;
  } | null;
}

const ResourceDetails: React.FunctionComponent<ResourceViewProps> = props => {
  const {
    resource,
    error,
    isFetching,
    onSuccess,
    dotGraph,
    links,
    goToResource,
  } = props;
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
              {links && (
                <TabPane tab="Links" key="2">
                  <div className="links-container">
                    <Card>
                      <AnimatedList
                        header={<>Incoming</>}
                        makeKey={(item: ResourceLink) =>
                          item.isExternal
                            ? (item.link as string)
                            : (item.link as Resource).id
                        }
                        results={links.incoming.results}
                        total={links.incoming.total}
                        itemComponent={(
                          resourceLink: ResourceLink,
                          index: number
                        ) => (
                          <div>
                            <div>{titleOf(resourceLink.predicate)}</div>
                            {resourceLink.isExternal ? (
                              <a
                                href={resourceLink.link as string}
                                target="_blank"
                              >
                                external link
                                {/* {resourceLink.link as string} */}
                              </a>
                            ) : (
                              <ResourceListItem
                                index={index}
                                resource={resourceLink.link as Resource}
                                onClick={() =>
                                  goToResource(resourceLink.link as Resource)
                                }
                              />
                            )}
                          </div>
                        )}
                      />
                    </Card>
                    <Card />
                  </div>
                </TabPane>
              )}
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
