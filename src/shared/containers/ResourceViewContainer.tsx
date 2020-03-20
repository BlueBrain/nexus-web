import * as React from 'react';
import Helmet from 'react-helmet';
import { useLocation, useHistory, useParams } from 'react-router';
import { Spin, Card, Empty, Tabs, notification, Alert, Collapse } from 'antd';
import * as queryString from 'query-string';
import { useNexusContext, AccessControl } from '@bbp/react-nexus';
import { Resource, ResourceLink, IncomingLink } from '@bbp/nexus-sdk';
import { getResourceLabel, getOrgAndProjectFromProjectId } from '../utils';
import ResourceCardComponent from '../components/ResourceCard';
import HistoryContainer from '../containers/HistoryContainer';
import ResourceLinksContainer from '../containers/ResourceLinks';
import ResourceActionsContainer from '../containers/ResourceActionsContainer';
import { isDeprecated } from '../utils/nexusMaybe';
import ResourceEditorContainer from '../containers/ResourceEditor';
import ImagePreviewContainer from '../containers/ImagePreviewContainer';
import SchemaLinkContainer from '../containers/SchemaLink';
import HomeIcon from '../components/HomeIcon';
import GraphContainer from '../containers/GraphContainer';
import useMeasure from '../hooks/useMeasure';
import ResourcePlugins from './ResourcePlugins';
import ResourceMetadata from '../components/ResourceMetadata';

const { Panel } = Collapse;
const TabPane = Tabs.TabPane;
export const DEFAULT_ACTIVE_TAB_KEY = '#JSON';

const ResourceViewContainer: React.FunctionComponent<{
  render?: (
    resource: Resource<{
      [key: string]: any;
    }> | null
  ) => React.ReactElement | null;
}> = ({ render }) => {
  const { orgLabel = '', projectLabel = '', resourceId = '' } = useParams();
  const nexus = useNexusContext();
  const location = useLocation();
  const history = useHistory();
  const goToResource = (
    orgLabel: string,
    projectLabel: string,
    resourceId: string,
    opt: {
      revision?: number;
      tab?: string;
      expanded?: boolean;
    }
  ) => {
    const { revision, tab, expanded } = opt;
    const pushRoute = `/${orgLabel}/${projectLabel}/resources/${resourceId}${
      revision ? `?rev=${revision}` : ''
    }${expanded ? '&expanded=true' : ''}${tab ? tab : ''}`;
    history.push(pushRoute, location.state);
  };
  const goToSelfResource = (selfUrl: string) => {
    history.push(`/?_self=${selfUrl}`);
  };
  const goToProject = (orgLabel: string, projectLabel: string) =>
    history.push(`/${orgLabel}/${projectLabel}`, location.state);
  const goToOrg = (orgLabel: string) =>
    history.push(`/${orgLabel}`, location.state);
  const { expanded: expandedFromQuery, rev } = queryString.parse(
    location.search
  );
  const activeTabKey = location.hash || DEFAULT_ACTIVE_TAB_KEY;
  const [{ ref }] = useMeasure();

  const [{ busy, resource, error }, setResource] = React.useState<{
    busy: boolean;
    resource: Resource | null;
    error: Error | null;
  }>({
    busy: false,
    resource: null,
    error: null,
  });
  const [latestResource, setLatestResource] = React.useState<
    (Resource & { [key: string]: any }) | null
  >(null);

  const isLatest =
    (latestResource && latestResource._rev) === (resource && resource._rev);

  const handleTabChange = (activeTabKey: string) => {
    goToResource(orgLabel, projectLabel, resourceId, {
      revision: resource ? resource._rev : undefined,
      tab: activeTabKey,
    });
  };

  const handleExpanded = (expanded: boolean) => {
    goToResource(orgLabel, projectLabel, resourceId, {
      expanded,
      revision: resource ? resource._rev : undefined,
      tab: activeTabKey,
    });
  };

  const handleEditFormSubmit = async (value: any) => {
    if (resource) {
      try {
        setResource({
          resource,
          error: null,
          busy: true,
        });
        const { _rev } = await nexus.Resource.update(
          orgLabel,
          projectLabel,
          resourceId,
          resource._rev,
          value
        );
        goToResource(orgLabel, projectLabel, resourceId, { revision: _rev });
        notification.success({
          message: 'Resource saved',
          description: getResourceLabel(resource),
          duration: 2,
        });
      } catch (error) {
        notification.error({
          message: 'An unknown error occurred',
          description: error.message,
          duration: 0,
        });
        setResource({
          error,
          resource: null,
          busy: false,
        });
      }
    }
  };

  const handleGoToInternalLink = (link: ResourceLink) => {
    const { orgLabel, projectLabel } = getOrgAndProjectFromProjectId(
      (link as IncomingLink)._project
    );
    goToResource(orgLabel, projectLabel, encodeURIComponent(link['@id']), {
      tab: '#links',
    });
  };

  React.useEffect(() => {
    setResource({
      resource,
      error: null,
      busy: true,
    });
    let latestResource: Resource | null = null;
    let newResource: Resource | null = null;
    let expandedResource: Resource | null = null;

    nexus.Resource.get(orgLabel, projectLabel, resourceId)
      .then(resource => {
        latestResource = resource as Resource;
        return rev
          ? nexus.Resource.get(orgLabel, projectLabel, resourceId, {
              rev: Number(rev),
            })
          : latestResource;
      })
      .then(resource => {
        newResource = resource as Resource;
        return nexus.Resource.get(orgLabel, projectLabel, resourceId, {
          format: 'expanded',
        });
      })
      .then(resource => {
        expandedResource = resource;

        setResource({
          // Note: we must fetch the proper, expanded @id. The @id that comes from a normal request or from the URL
          // could be the contracted one, if the resource was created with a context that has a @base property.
          // this would make the contracted @id unresolvable. See issue: https://github.com/BlueBrain/nexus/issues/966
          resource: {
            ...newResource,
            '@id': expandedResource['@id'],
          } as Resource,
          error: null,
          busy: false,
        });
        setLatestResource(latestResource);
      })
      .catch(error => {
        // error
        setResource({
          error,
          resource,
          busy: false,
        });
      });
  }, [orgLabel, projectLabel, resourceId, rev]);

  return (
    <>
      <div className="resource-details">
        {!!resource && (
          <Helmet
            title={`${getResourceLabel(
              resource
            )} | ${projectLabel} | ${orgLabel} | Nexus Web`}
            meta={[
              {
                name: 'description',
                content: getResourceLabel(resource),
              },
            ]}
          />
        )}
        <Spin spinning={busy}>
          {!!error && (
            <Card>
              <Empty
                description={'There was a problem loading this resource...'}
              />
            </Card>
          )}
          {!!resource && !!latestResource && !error && (
            <>
              <h1 className="name">
                <HomeIcon />
                {' | '}
                <span>
                  <a onClick={() => goToOrg(orgLabel)}>{orgLabel}</a> |{' '}
                  <a onClick={() => goToProject(orgLabel, projectLabel)}>
                    {projectLabel}
                  </a>{' '}
                  |{' '}
                </span>
                {getResourceLabel(resource)}
              </h1>
              {!isLatest && (
                <Alert
                  type="warning"
                  message="You are viewing an older version of this resource."
                  closable
                />
              )}
              {isDeprecated(resource) && (
                <Alert
                  type="warning"
                  message="This is a deprecated resource."
                  closable
                />
              )}
              <ResourcePlugins
                resource={resource}
                goToResource={goToSelfResource}
              />
              <AccessControl
                path={`/${orgLabel}/${projectLabel}`}
                permissions={['resources/write']}
              >
                <Collapse defaultActiveKey="1" onChange={() => {}}>
                  <Panel header={<h3>Admin</h3>} key="1">
                    <ResourceActionsContainer resource={resource} />
                    <ResourceMetadata
                      resource={resource}
                      schemaLink={SchemaLinkContainer}
                    />
                    <Tabs activeKey={activeTabKey} onChange={handleTabChange}>
                      <TabPane tab="JSON" key="#JSON">
                        <ResourceEditorContainer
                          resourceId={resource['@id']}
                          orgLabel={orgLabel}
                          projectLabel={projectLabel}
                          rev={resource._rev}
                          defaultExpanded={
                            !!expandedFromQuery && expandedFromQuery === 'true'
                          }
                          defaultEditable={isLatest && !isDeprecated(resource)}
                          onSubmit={handleEditFormSubmit}
                          onExpanded={handleExpanded}
                        />
                      </TabPane>
                      <TabPane tab="History" key="#history">
                        <HistoryContainer
                          resourceId={resource['@id']}
                          orgLabel={orgLabel}
                          projectLabel={projectLabel}
                          latestRev={latestResource._rev}
                          link={(rev: number) => {
                            return (
                              <a
                                onClick={() => {
                                  goToResource(
                                    orgLabel,
                                    projectLabel,
                                    resourceId,
                                    {
                                      revision: rev,
                                    }
                                  );
                                }}
                              >
                                Revision {rev}
                              </a>
                            );
                          }}
                        />
                      </TabPane>
                      <TabPane tab="Links" key="#links" className="rows">
                        <section className="links incoming">
                          <h3>Incoming</h3>
                          <ResourceLinksContainer
                            resourceId={resource['@id']}
                            orgLabel={orgLabel}
                            projectLabel={projectLabel}
                            rev={resource._rev}
                            direction="incoming"
                            onClick={handleGoToInternalLink}
                          />
                        </section>
                        <section className="links outgoing">
                          <h3>Outgoing</h3>
                          <ResourceLinksContainer
                            resourceId={resource['@id']}
                            orgLabel={orgLabel}
                            projectLabel={projectLabel}
                            rev={resource._rev}
                            direction="outgoing"
                            onClick={handleGoToInternalLink}
                          />
                        </section>
                      </TabPane>
                      <TabPane tab="Graph" key="#graph" className="rows">
                        <div className="graph-wrapper-container">
                          <div className="fixed-minus-header">
                            <div ref={ref} className="graph-wrapper">
                              {resource ? (
                                <GraphContainer
                                  resource={resource as Resource}
                                />
                              ) : null}
                            </div>
                          </div>
                        </div>
                      </TabPane>
                    </Tabs>
                  </Panel>
                </Collapse>
              </AccessControl>
            </>
          )}
        </Spin>
      </div>
    </>
  );
};

export default ResourceViewContainer;
