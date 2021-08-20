import * as React from 'react';
import Helmet from 'react-helmet';
import { useLocation, useHistory, useParams } from 'react-router';
import { Spin, Alert, Collapse, Typography } from 'antd';
import * as queryString from 'query-string';
import { useNexusContext, AccessControl } from '@bbp/react-nexus';
import {
  Resource,
  ResourceLink,
  IncomingLink,
  ExpandedResource,
} from '@bbp/nexus-sdk';
import AdminPlugin from '../containers/AdminPluginContainer';
import VideoPluginContainer from '../containers/VideoPluginContainer';
import ResourcePlugins from './ResourcePlugins';
import usePlugins from '../hooks/usePlugins';
import useMeasure from '../hooks/useMeasure';
import {
  getResourceLabel,
  getOrgAndProjectFromProjectId,
  matchPlugins,
  pluginsMap,
  getDestinationParam,
  labelOf,
} from '../utils';
import { isDeprecated } from '../utils/nexusMaybe';
import useNotification from '../hooks/useNotification';
import Preview from '../components/Preview/Preview';
import { getUpdateResourceFunction } from '../utils/updateResource';

export type PluginMapping = {
  [pluginKey: string]: object;
};

export const DEFAULT_ACTIVE_TAB_KEY = '#JSON';

const ResourceViewContainer: React.FunctionComponent<{
  render?: (
    resource: Resource<{
      [key: string]: any;
    }> | null
  ) => React.ReactElement | null;
}> = ({ render }) => {
  const x = useParams();

  // @ts-ignore
  const { orgLabel = '', projectLabel = '', resourceId = '' } = useParams();
  const nexus = useNexusContext();
  const location = useLocation();
  const history = useHistory();
  const notification = useNotification();
  const [{ ref }] = useMeasure();
  const { data: pluginManifest } = usePlugins();
  const availablePlugins = Object.keys(pluginManifest || {});

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
    history.push(`/?_self=${selfUrl}`, location.state);
  };

  const goToProject = (orgLabel: string, projectLabel: string) =>
    history.push(`/admin/${orgLabel}/${projectLabel}`);

  const goToOrg = (orgLabel: string) => history.push(`/admin/${orgLabel}`);

  const { expanded: expandedFromQuery, rev, tag } = queryString.parse(
    location.search
  );

  const activeTabKey = location.hash || DEFAULT_ACTIVE_TAB_KEY;

  const [{ busy, resource, error }, setResource] = React.useState<{
    busy: boolean;
    resource: Resource | null;
    error:
      | (Error & {
          action?: 'update' | 'view';
          rejections?: { reason: string }[];
          wasUpdated?: boolean;
        })
      | null;
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

  const filteredPlugins =
    resource &&
    pluginManifest &&
    matchPlugins(pluginsMap(pluginManifest), availablePlugins, resource);

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
        const updateFn = getUpdateResourceFunction(
          nexus,
          resource._rev,
          value,
          resource,
          orgLabel,
          projectLabel,
          resourceId
        );

        const { _rev } = await updateFn();
        goToResource(orgLabel, projectLabel, resourceId, { revision: _rev });
        notification.success({
          message: 'Resource saved',
          description: getResourceLabel(resource),
        });
      } catch (error) {
        const potentiallyUpdatedResource = (await nexus.Resource.get(
          orgLabel,
          projectLabel,
          resourceId
        )) as Resource;
        error.wasUpdated = potentiallyUpdatedResource._rev !== resource._rev;

        error.action = 'update';
        if ('@context' in error) {
          if ('rejections' in error) {
            error.message = 'An error occurred whilst updating the resource';
          } else {
            error.message = error.reason;
          }
        }

        notification.error({
          message: 'An error occurred whilst updating the resource',
        });
        if (error.wasUpdated) {
          const expandedResources = (await nexus.Resource.get(
            orgLabel,
            projectLabel,
            resourceId,
            {
              format: 'expanded',
            }
          )) as ExpandedResource[];

          const expandedResource = expandedResources[0];

          setResource({
            error,
            resource: {
              ...potentiallyUpdatedResource,
              '@id': expandedResource['@id'],
            } as Resource,
            busy: false,
          });

          setLatestResource(potentiallyUpdatedResource);
        } else {
          setResource({
            resource,
            error,
            busy: false,
          });
        }
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

  const setResources = async () => {
    setResource({
      resource,
      error: null,
      busy: true,
    });
    try {
      const options = tag
        ? {
            tag: tag.toString(),
          }
        : {
            rev: Number(rev),
          };
      const resource = (await nexus.Resource.get(
        orgLabel,
        projectLabel,
        resourceId
      )) as Resource;

      const latestResource: Resource =
        rev || tag
          ? ((await nexus.Resource.get(
              orgLabel,
              projectLabel,
              resourceId,
              options
            )) as Resource)
          : resource;

      const expandedResources = (await nexus.Resource.get(
        orgLabel,
        projectLabel,
        resourceId,
        {
          format: 'expanded',
        }
      )) as ExpandedResource[];

      const expandedResource = expandedResources[0];

      setLatestResource(latestResource);
      setResource({
        // Note: we must fetch the proper, expanded @id. The @id that comes from a normal request or from the URL
        // could be the contracted one, if the resource was created with a context that has a @base property.
        // this would make the contracted @id unresolvable. See issue: https://github.com/BlueBrain/nexus/issues/966
        resource: {
          ...latestResource,
          '@id': expandedResource['@id'],
        } as Resource,
        error: null,
        busy: false,
      });
    } catch (error) {
      let errorMessage;

      if (error['@type'] === 'AuthorizationFailed') {
        nexus.Identity.list().then(({ identities }) => {
          const user = identities.find(i => i['@type'] === 'User');

          if (!user) {
            history.push(`/login${getDestinationParam()}`);
          }

          const message = user
            ? "You don't have the permissions to view the resource"
            : 'Please login to view the resource';

          notification.error({
            message: 'Authentication error',
            description: message,
          });
        });

        errorMessage = `You don't have the access rights for this resource located in ${orgLabel} / ${projectLabel}.`;
      } else if (error['@type'] === 'ResourceNotFound') {
        errorMessage = `Resource '${resourceId}' not found`;
      } else {
        errorMessage = error.reason;
      }
      const jsError = new Error(errorMessage);

      setResource({
        resource,
        error: jsError,
        busy: false,
      });
    }
  };

  const nonEditableResourceTypes = ['File'];

  React.useEffect(() => {
    setResources();
  }, [orgLabel, projectLabel, resourceId, rev, tag]);

  return (
    <>
      <div className="resource-details">
        <>
          <Helmet
            title={`${
              resource ? getResourceLabel(resource) : resourceId
            } | ${projectLabel} | ${orgLabel} | Nexus Web`}
            meta={[
              {
                name: 'description',
                content: resource
                  ? getResourceLabel(resource)
                  : labelOf(decodeURIComponent(resourceId)),
              },
            ]}
          />

          <h1 className="name">
            <span>
              <a onClick={() => goToOrg(orgLabel)}>{orgLabel}</a> |{' '}
              <a onClick={() => goToProject(orgLabel, projectLabel)}>
                {projectLabel}
              </a>{' '}
              |{' '}
            </span>
            {resource
              ? getResourceLabel(resource)
              : labelOf(decodeURIComponent(resourceId))}
          </h1>
        </>

        <Spin spinning={busy}>
          {!!error && (
            <>
              <Alert
                message={
                  error.wasUpdated ? 'Resource updated with errors' : 'Error'
                }
                showIcon
                closable
                type="error"
                description={
                  <>
                    <Typography.Paragraph
                      ellipsis={{ rows: 2, expandable: true }}
                    >
                      {error.message}
                    </Typography.Paragraph>
                    {error.rejections && (
                      <Collapse bordered={false} ghost>
                        <Collapse.Panel key={1} header="More detail...">
                          <>
                            <ul>
                              {error.rejections.map((el, ix) => (
                                <li key={ix}>{el.reason}</li>
                              ))}
                            </ul>

                            <p>
                              For further information please refer to the API
                              documentation,{' '}
                              <a
                                target="_blank"
                                href="https://bluebrainnexus.io/docs/delta/api/"
                              >
                                https://bluebrainnexus.io/docs/delta/api/
                              </a>
                            </p>
                          </>
                        </Collapse.Panel>
                      </Collapse>
                    )}
                  </>
                }
              />
              <br />
            </>
          )}
          {!!resource && !!latestResource && (
            <>
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
              {filteredPlugins && filteredPlugins.length > 0 && (
                <ResourcePlugins
                  resource={resource}
                  goToResource={goToSelfResource}
                />
              )}

              <AccessControl
                path={`/${orgLabel}/${projectLabel}`}
                permissions={['resources/write']}
                noAccessComponent={() => (
                  <div>
                    <div style={{ marginTop: 15 }}>
                      <Alert
                        message="You don't have access to edit the resource. You can nonetheless see the resource metadata below."
                        type="info"
                      />
                      {resource.distribution && (
                        <Preview nexus={nexus} resource={resource} />
                      )}
                      <AdminPlugin
                        editable={false}
                        orgLabel={orgLabel}
                        projectLabel={projectLabel}
                        resourceId={resourceId}
                        resource={resource}
                        latestResource={latestResource}
                        activeTabKey={activeTabKey}
                        expandedFromQuery={expandedFromQuery}
                        refProp={ref}
                        goToResource={goToResource}
                        handleTabChange={handleTabChange}
                        handleGoToInternalLink={handleGoToInternalLink}
                        handleEditFormSubmit={handleEditFormSubmit}
                        handleExpanded={handleExpanded}
                      />
                    </div>
                  </div>
                )}
              >
                {!!resource['@type'] &&
                  typeof resource['@type'] === 'string' &&
                  nonEditableResourceTypes.includes(resource['@type']) && (
                    <p>
                      <Alert
                        message="This resource is not editable because it is of the type 'File'. For further information please contact the administrator."
                        type="info"
                      />
                    </p>
                  )}
                {resource.distribution && (
                  <Preview nexus={nexus} resource={resource} />
                )}
                <AdminPlugin
                  editable={isLatest && !isDeprecated(resource)}
                  orgLabel={orgLabel}
                  projectLabel={projectLabel}
                  resourceId={resourceId}
                  resource={resource}
                  latestResource={latestResource}
                  activeTabKey={activeTabKey}
                  expandedFromQuery={expandedFromQuery}
                  refProp={ref}
                  goToResource={goToResource}
                  handleTabChange={handleTabChange}
                  handleGoToInternalLink={handleGoToInternalLink}
                  handleEditFormSubmit={handleEditFormSubmit}
                  handleExpanded={handleExpanded}
                />
                <VideoPluginContainer
                  resource={resource}
                  orgLabel={orgLabel}
                  projectLabel={projectLabel}
                />
              </AccessControl>
            </>
          )}
        </Spin>
      </div>
    </>
  );
};

export default ResourceViewContainer;
