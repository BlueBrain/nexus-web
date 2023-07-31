import * as React from 'react';
import Helmet from 'react-helmet';
import {
  useLocation,
  useHistory,
  useParams,
  matchPath,
  useRouteMatch,
} from 'react-router';
import { Spin, Alert, Collapse, Typography, Divider } from 'antd';
import queryString from 'query-string';
import { useNexusContext } from '@bbp/react-nexus';
import { Resource, IncomingLink, ExpandedResource } from '@bbp/nexus-sdk/es';
import { useSelector, useDispatch } from 'react-redux';
import { intersection, isArray } from 'lodash';
import AdminPlugin from '../containers/AdminPluginContainer';
import VideoPluginContainer from './VideoPluginContainer/VideoPluginContainer';
import ResourcePlugins from './ResourcePlugins';
import usePlugins from '../hooks/usePlugins';
import useMeasure from '../hooks/useMeasure';
import {
  getResourceLabel,
  getOrgAndProjectFromProjectId,
  getDestinationParam,
  labelOf,
  makeResourceUri,
} from '../utils';
import { isDeprecated } from '../utils/nexusMaybe';
import useNotification from '../hooks/useNotification';
import Preview from '../components/Preview/Preview';
import ImagePreview from '../components/ImagePreview/ImagePreview';
import { getUpdateResourceFunction } from '../utils/updateResource';
import { DeleteOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import ResourceViewActionsContainer from './ResourceViewActionsContainer';
import ResourceMetadata from '../components/ResourceMetadata';
import { ResourceLinkAugmented } from '../components/ResourceLinks/ResourceLinkItem';
import JIRAPluginContainer from './JIRA/JIRAPluginContainer';
import { RootState } from '../store/reducers';
import { StudioResource } from '../../subapps/studioLegacy/containers/StudioContainer';
import { useJiraPlugin } from '../hooks/useJIRA';
import AnalysisPluginContainer from './AnalysisPlugin/AnalysisPluginContainer';
import { UISettingsActionTypes } from '../../shared/store/actions/ui-settings';
import {
  TErrorWithType,
  TUpdateResourceFunctionError,
} from '../../utils/types';

export type PluginMapping = {
  [pluginKey: string]: object;
};

export const DEFAULT_ACTIVE_TAB_KEY = '#JSON';

const containsImages = (distribution: any[]) => {
  const encodingFormat = distribution.map(t => t.encodingFormat);
  const formats = [
    'image/png',
    'image/webp',
    'image/bmp',
    'image/jpeg',
    'image/jpg',
    'image/gif',
  ];
  return intersection(encodingFormat, formats).length !== 0;
};

const ResourceViewContainer: React.FunctionComponent<{
  render?: (
    resource: Resource<{
      [key: string]: any;
    }> | null
  ) => React.ReactElement | null;
  deOrgLabel?: string;
  deProjectLabel?: string;
  deResourceId?: string;
}> = ({ render, deOrgLabel, deProjectLabel, deResourceId }) => {
  const history = useHistory();
  const nexus = useNexusContext();
  const notification = useNotification();
  const dispatch = useDispatch();

  const location = useLocation<{ background: Location }>();
  const [{ ref }] = useMeasure();
  const { data: pluginManifest } = usePlugins();
  const { apiEndpoint } = useSelector((state: RootState) => state.config);

  const [deltaPlugins, setDeltaPlugins] = React.useState<{
    [key: string]: string;
  }>();
  const fetchDeltaVersion = async () => {
    await nexus
      .httpGet({
        path: `${apiEndpoint}/version`,
        context: { as: 'json' },
      })
      .then(versions => setDeltaPlugins({ ...versions.plugins }))
      .catch(error => {
        // do nothing
      });
  };

  React.useEffect(() => {
    fetchDeltaVersion();
  }, []);

  const match = useRouteMatch<{
    orgLabel: string;
    projectLabel: string;
    resourceId: string;
  }>(`/:orgLabel/:projectLabel/resources/:resourceId`);

  const orgLabel = match?.params.orgLabel! ?? deOrgLabel;
  const projectLabel = match?.params.projectLabel! ?? deProjectLabel;
  const resourceId =
    match?.params.resourceId! ??
    (deResourceId ? encodeURIComponent(deResourceId) : '');

  const [studioPlugins, setStudioPlugins] = React.useState<{
    customise: boolean;
    plugins: { key: string; expanded: boolean }[];
  }>();

  React.useEffect(() => {
    if (location.state && location.state.background) {
      const studioPathMatch = matchPath<{ StudioId: string }>(
        location.state.background.pathname,
        {
          path: '/studios/:organisation/:project/studios/:StudioId',
          exact: true,
          strict: false,
        }
      );

      if (studioPathMatch) {
        // looks like we have us a studio
        const studioId = studioPathMatch.params.StudioId;
        nexus.Resource.get<StudioResource>(
          orgLabel,
          projectLabel,
          studioId
        ).then(d => {
          if (Array.isArray((d as StudioResource).plugins)) {
            // @ts-ignore
            (d as StudioResource).plugins = (d as StudioResource).plugins[0];
          }
          if ((d as StudioResource).plugins) {
            setStudioPlugins((d as StudioResource).plugins);
          }
        });
      }
    }
  }, []);

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

  const isLatest = latestResource?._rev === resource?._rev;

  const handleTabChange = (activeTabKey: string) => {
    const newLink = `${location.pathname}${location.search}${activeTabKey}`;
    history.push(newLink, location.state);
  };
  const handleExpanded = (expanded: boolean) => {
    const searchParams = new URLSearchParams(location.search);
    searchParams.set('expanded', expanded ? 'true' : 'false');
    const newLink = `${location.pathname}?${searchParams.toString()}`;
    history.push(newLink, location.state);
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
        (error as TUpdateResourceFunctionError).wasUpdated =
          potentiallyUpdatedResource._rev !== resource._rev;

        (error as TUpdateResourceFunctionError).action = 'update';
        if ('@context' in (error as TUpdateResourceFunctionError)) {
          if ('rejections' in (error as TUpdateResourceFunctionError)) {
            (error as TUpdateResourceFunctionError).message =
              'An error occurred whilst updating the resource';
          } else {
            (error as TUpdateResourceFunctionError).message = (error as TUpdateResourceFunctionError).reason;
          }
        }

        notification.error({
          message: 'An error occurred whilst updating the resource',
        });
        if ((error as TUpdateResourceFunctionError).wasUpdated) {
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
            error: error as TUpdateResourceFunctionError,
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
            error: error as Error,
            busy: false,
          });
        }
      }
    }
  };

  const handleGoToInternalLink = (link: ResourceLinkAugmented) => {
    const { orgLabel, projectLabel } = getOrgAndProjectFromProjectId(
      (link as IncomingLink)._project
    )!;

    const revisionOption = link.isRevisionSpecific
      ? { revision: link._rev }
      : {};

    goToResource(orgLabel, projectLabel, encodeURIComponent(link['@id']), {
      ...revisionOption,
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
      const options = tag ? { tag: tag.toString() } : { rev: Number(rev) };
      const resource = (await nexus.Resource.get(
        orgLabel,
        projectLabel,
        resourceId
      )) as Resource;
      const selectedResource: Resource =
        rev || tag
          ? ((await nexus.Resource.get(
              orgLabel,
              projectLabel,
              resourceId,
              options
            )) as Resource)
          : resource;
      dispatch({
        type: UISettingsActionTypes.UPDATE_CURRENT_RESOURCE_VIEW,
        payload: resource,
      });
      const expandedResources = (await nexus.Resource.get(
        orgLabel,
        projectLabel,
        resourceId,
        {
          format: 'expanded',
        }
      )) as ExpandedResource[];

      const expandedResource = expandedResources[0];
      setLatestResource(resource);
      setResource({
        // Note: we must fetch the proper, expanded @id. The @id that comes from a normal request or from the URL
        // could be the contracted one, if the resource was created with a context that has a @base property.
        // this would make the contracted @id unresolvable. See issue: https://github.com/BlueBrain/nexus/issues/966
        resource: {
          ...selectedResource,
          '@id': expandedResource['@id'],
        } as Resource,
        error: null,
        busy: false,
      });
    } catch (error) {
      let errorMessage;

      if ((error as TErrorWithType)['@type'] === 'AuthorizationFailed') {
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
      } else if ((error as TErrorWithType)['@type'] === 'ResourceNotFound') {
        errorMessage = `Resource '${resourceId}' not found`;
      } else {
        errorMessage = (error as TErrorWithType).reason;
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

  const refreshResource = () => setResources();

  React.useEffect(() => {
    setResources();
  }, [orgLabel, projectLabel, resourceId, rev, tag]);

  const [openPlugins, setOpenPlugins] = React.useState<string[]>([]);
  const LOCAL_STORAGE_EXPANDED_PLUGINS_KEY_NAME = 'expanded_plugins';

  React.useEffect(() => {
    if (localStorage.getItem(LOCAL_STORAGE_EXPANDED_PLUGINS_KEY_NAME)) {
      setOpenPlugins(
        JSON.parse(
          localStorage.getItem(
            LOCAL_STORAGE_EXPANDED_PLUGINS_KEY_NAME
          ) as string
        )
      );
    }
  }, []);

  React.useEffect(() => {
    localStorage.setItem(
      LOCAL_STORAGE_EXPANDED_PLUGINS_KEY_NAME,
      JSON.stringify(openPlugins)
    );
  }, [openPlugins]);

  React.useEffect(() => {
    // if coming from studio, override what user has set in localstorage
    if (studioPlugins?.customise && pluginManifest) {
      setOpenPlugins(
        studioPlugins.plugins
          .filter(p => p.expanded)
          .filter(
            p =>
              p.key in pluginManifest ||
              builtInPlugins.find(b => b.key === p.key)
          )
          .map(p => {
            if (builtInPlugins.find(b => b.key === p.key)) {
              const pluginName = builtInPlugins.find(b => b.key === p.key)
                ?.name;
              return pluginName ? pluginName : '';
            }
            return pluginManifest[p.key].name;
          })
      );
    }
  }, [studioPlugins]);

  const pluginCollapsedToggle = (pluginName: string) => {
    setOpenPlugins(
      openPlugins.includes(pluginName)
        ? openPlugins.filter(p => p !== pluginName)
        : [...openPlugins, pluginName]
    );
  };

  const showPluginConsideringStudioContext = (pluginKey: string) => {
    return (
      (studioPlugins?.customise &&
        studioPlugins?.plugins.find(p => p.key === pluginKey)) ||
      !studioPlugins?.customise
    );
  };

  const previewPlugin = resource &&
    showPluginConsideringStudioContext('preview') &&
    resource.distribution && (
      <Preview
        key="previewPlugin"
        nexus={nexus}
        resource={resource}
        collapsed={openPlugins.includes('preview')}
        handleCollapseChanged={() => {
          pluginCollapsedToggle('preview');
        }}
      />
    );
  const resourceContainsImages =
    resource &&
    isArray(resource.distribution) &&
    containsImages(resource.distribution);
  const imagePreviewPlugin = resource &&
    showPluginConsideringStudioContext('preview') &&
    resource.distribution &&
    resourceContainsImages && (
      <ImagePreview
        key="imagePreviewPlugin"
        nexus={nexus}
        resource={resource}
        collapsed={openPlugins.includes('imagePreview')}
        handleCollapseChanged={() => {
          pluginCollapsedToggle('imagePreview');
        }}
      />
    );

  const adminPlugin = resource &&
    latestResource &&
    ((studioPlugins?.customise &&
      studioPlugins?.plugins.find(p => p.key === 'admin')) ||
      !studioPlugins?.customise) && (
      <AdminPlugin
        key="adminPlugin"
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
        refreshResource={refreshResource}
        collapsed={openPlugins.includes('advanced')}
        handleCollapseChanged={() => {
          pluginCollapsedToggle('advanced');
        }}
        showFullScreen={true}
      />
    );

  const videoPlugin = resource &&
    resource['video'] &&
    ((studioPlugins?.customise &&
      studioPlugins?.plugins.find(p => p.key === 'video')) ||
      !studioPlugins?.customise) && (
      <VideoPluginContainer
        key="videoPlugin"
        resource={resource}
        orgLabel={orgLabel}
        projectLabel={projectLabel}
        collapsed={openPlugins.includes('video')}
        handleCollapseChanged={() => {
          pluginCollapsedToggle('video');
        }}
      />
    );
  const {
    isUserInSupportedJiraRealm,
    jiraInaccessibleBecauseOfVPN,
  } = useJiraPlugin();

  const jiraPlugin = resource &&
    deltaPlugins &&
    'jira' in deltaPlugins &&
    isUserInSupportedJiraRealm &&
    !jiraInaccessibleBecauseOfVPN && (
      <Collapse
        onChange={() => {
          pluginCollapsedToggle('jira');
        }}
        activeKey={openPlugins.includes('jira') ? 'jira' : undefined}
      >
        <Collapse.Panel header="JIRA" key="jira">
          {openPlugins.includes('jira') && (
            <JIRAPluginContainer
              resource={resource}
              orgLabel={orgLabel}
              projectLabel={projectLabel}
            />
          )}
        </Collapse.Panel>
      </Collapse>
    );

  const { analysisPluginShowOnTypes, analysisPluginExcludeTypes } = useSelector(
    (state: RootState) => state.config
  );

  const resourceTypes = resource && [resource['@type']].flat();
  const resourceHasAnalysisIncludedType = resourceTypes?.some(t =>
    analysisPluginShowOnTypes.some(showOnType => t === showOnType)
  );
  const resourceHasAnalysisExcludedType = resourceTypes?.some(t =>
    analysisPluginExcludeTypes.some(excludeOnType => t === excludeOnType)
  );

  const showAnalysisPlugin =
    resource &&
    resourceHasAnalysisIncludedType &&
    !resourceHasAnalysisExcludedType;

  const analysisPlugin = resource &&
    showAnalysisPlugin &&
    showPluginConsideringStudioContext('analysis') && (
      <Collapse
        onChange={() => {
          pluginCollapsedToggle('analysis');
        }}
        activeKey={openPlugins.includes('analysis') ? 'analysis' : undefined}
      >
        <Collapse.Panel header="Report" key="analysis">
          {openPlugins.includes('analysis') && (
            <AnalysisPluginContainer
              resourceId={resource['@id']}
              orgLabel={orgLabel}
              projectLabel={projectLabel}
            />
          )}
        </Collapse.Panel>
      </Collapse>
    );

  const builtInPlugins = [
    { key: 'preview', name: 'preview', pluginComponent: previewPlugin },
    {
      key: 'imagePreview',
      name: 'imagePreview',
      pluginComponent: imagePreviewPlugin,
    },
    { key: 'admin', name: 'advanced', pluginComponent: adminPlugin },
    { key: 'video', name: 'video', pluginComponent: videoPlugin },
    { key: 'jira', name: 'jira', pluginComponent: jiraPlugin },
    { key: 'analysis', name: 'Analysis', pluginComponent: analysisPlugin },
  ];
  React.useEffect(() => {
    return () => {
      dispatch({
        type: UISettingsActionTypes.UPDATE_CURRENT_RESOURCE_VIEW,
        payload: null,
      });
    };
  }, []);
  return (
    <>
      <div className="resource-details">
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

        <Spin spinning={busy}>
          {!!error ? (
            <Alert
              message={
                error.wasUpdated ? 'Resource updated with errors' : 'Error'
              }
              showIcon
              closable
              style={{ marginTop: 40 }}
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
          ) : (
            <>
              {resource && (
                <ResourceViewActionsContainer
                  resource={resource}
                  latestResource={latestResource as Resource}
                  isLatest={isLatest}
                  orgLabel={orgLabel}
                  projectLabel={projectLabel}
                />
              )}
              <h1 className="name">
                <Link
                  to={makeResourceUri(
                    orgLabel,
                    projectLabel,
                    decodeURIComponent(resourceId),
                    {}
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {resource
                    ? getResourceLabel(resource)
                    : labelOf(decodeURIComponent(resourceId))}
                </Link>
              </h1>
              {resource && (
                <ResourceMetadata
                  orgLabel={orgLabel}
                  projectLabel={projectLabel}
                  resource={resource}
                />
              )}
              <Divider />
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
                    <>
                      <Alert
                        type="error"
                        message={
                          <>
                            <DeleteOutlined /> This resource is deprecated. You
                            cannot modify it.
                          </>
                        }
                      />
                      <br />
                    </>
                  )}
                  <ResourcePlugins
                    resource={resource}
                    goToResource={goToSelfResource}
                    openPlugins={openPlugins}
                    studioDefinedPluginsToInclude={
                      studioPlugins && studioPlugins.customise
                        ? studioPlugins.plugins.map(p => p.key)
                        : undefined
                    }
                    builtInPlugins={builtInPlugins}
                    handleCollapseChange={pluginName =>
                      pluginCollapsedToggle(pluginName)
                    }
                  />
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
                </>
              )}
            </>
          )}
        </Spin>
      </div>
    </>
  );
};

export default ResourceViewContainer;
