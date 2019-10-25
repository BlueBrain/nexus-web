import * as React from 'react';
import { connect } from 'react-redux';
import Helmet from 'react-helmet';
import { push } from 'connected-react-router';
import { match } from 'react-router';
import { Spin, Card, Empty, Tabs, notification, Alert } from 'antd';
import * as queryString from 'query-string';
import { useAsyncEffect } from 'use-async-effect';
import { useNexusContext } from '@bbp/react-nexus';
// TODO: update when SDK has ResourceLink
// @ts-ignore
import { Resource, ResourceLink } from '@bbp/nexus-sdk';

import {
  getResourceLabel,
  getResourceLabelsAndIdsFromSelf,
  getMetadataFromExpandedResource,
} from '../utils';
import ResourceCardComponent from '../components/ResourceCard';
import ResourceEditor from '../components/Resources/ResourceEditor';
import HistoryContainer from '../containers/HistoryContainer';
import ResourceLinksContainer from '../containers/ResourceLinks';
import ResourceActionsContainer from '../containers/ResourceActions';
import { isDeprecated } from '../utils/nexus-maybe';

const TabPane = Tabs.TabPane;
const DEFAULT_ACTIVE_TAB_KEY = '#JSON';

interface ResourceViewProps {
  location: Location;
  match: match<{ org: string; project: string; resourceId: string }>;
  goToOrg: (orgLabel: string) => void;
  goToProject: (orgLabel: string, projectLabel: string) => void;
  goToResource: (
    orgLabel: string,
    projectLabel: string,
    resourceId: string,
    opt: {
      revision?: number;
      tab?: string;
    }
  ) => void;
}

const ResourceView: React.FunctionComponent<ResourceViewProps> = props => {
  const { match, goToOrg, goToProject, goToResource } = props;
  const {
    params: { org: orgLabel, project: projectLabel, resourceId },
  } = match;
  const { expanded: expandedFromQuery, rev } = queryString.parse(
    location.search
  );
  const activeTabKey = location.hash || DEFAULT_ACTIVE_TAB_KEY;

  const [expanded, setExpanded] = React.useState(!!expandedFromQuery);
  const nexus = useNexusContext();

  const [{ busy, resource, error }, setResource] = React.useState<{
    busy: boolean;
    // TODO: remove once SDK is updated to allow generic Resource Types
    resource: Resource & { [key: string]: any } | null;
    error: Error | null;
  }>({
    busy: false,
    resource: null,
    error: null,
  });

  const [latestResource, setLatestResource] = React.useState<
    Resource & { [key: string]: any } | null
  >(null);

  const isLatest =
    (latestResource && latestResource._rev) === (resource && resource._rev);

  const isEditable = isLatest && !expanded;

  const handleTabChange = (activeTabKey: string) => {
    goToResource(orgLabel, projectLabel, resourceId, {
      revision: resource ? resource._rev : undefined,
      tab: activeTabKey,
    });
  };

  const handleFormatChange = () => {
    setExpanded(!expanded);
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
    const {
      orgLabel,
      projectLabel,
      resourceId,
    } = getResourceLabelsAndIdsFromSelf(link._self);
    goToResource(orgLabel, projectLabel, resourceId, { tab: '#links' });
  };

  useAsyncEffect(async () => {
    try {
      setResource({
        resource,
        error: null,
        busy: true,
      });
      // TODO: get resource from source endpoint
      const latestResource = await nexus.Resource.get(
        orgLabel,
        projectLabel,
        resourceId,
        { format: expanded ? 'expanded' : 'compacted' }
      );
      const newResource = rev
        ? await nexus.Resource.get(orgLabel, projectLabel, resourceId, {
            rev: Number(rev),
            format: expanded ? 'expanded' : 'compacted',
          })
        : latestResource;
      setResource({
        resource: newResource,
        error: null,
        busy: false,
      });
      setLatestResource(latestResource);
    } catch (error) {
      setResource({
        error,
        resource,
        busy: false,
      });
    }
  }, [orgLabel, projectLabel, resourceId, rev, expanded]);

  return (
    <div className="resource-view view-container">
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
      <div className="resource-details" style={{ width: '100%' }}>
        <Spin spinning={busy} style={{ width: '100%' }}>
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
                  style={{ margin: '1em 0' }}
                  type="warning"
                  message="You are viewing an older version of this resource."
                  closable
                />
              )}
              {isDeprecated(getMetadataFromExpandedResource(resource)) && (
                <Alert
                  style={{ margin: '1em 0' }}
                  type="warning"
                  message="This is a deprecated resource."
                  closable
                />
              )}
              <ResourceCardComponent
                resource={getMetadataFromExpandedResource(resource)}
              />
              <ResourceActionsContainer
                resource={getMetadataFromExpandedResource(resource)}
              />
              <Tabs activeKey={activeTabKey} onChange={handleTabChange}>
                <TabPane tab="JSON" key="#JSON">
                  <ResourceEditor
                    busy={busy}
                    rawData={resource}
                    onSubmit={handleEditFormSubmit}
                    onFormatChange={handleFormatChange}
                    editable={isEditable}
                    expanded={expanded}
                  />
                </TabPane>
                <TabPane tab="History" key="#history">
                  <HistoryContainer
                    self={
                      latestResource._self ||
                      // if expanded
                      latestResource[
                        'https://bluebrain.github.io/nexus/vocabulary/self'
                      ]
                    }
                    latestRev={
                      latestResource._rev ||
                      // if expanded
                      latestResource[
                        'https://bluebrain.github.io/nexus/vocabulary/rev'
                      ]
                    }
                    link={(rev: number) => {
                      return (
                        <a
                          onClick={() => {
                            goToResource(orgLabel, projectLabel, resourceId, {
                              revision: rev,
                            });
                          }}
                        >
                          Revision {rev}
                        </a>
                      );
                    }}
                  />
                </TabPane>
                <TabPane tab="Links" key="#links">
                  <div
                    style={{ display: 'flex', justifyContent: 'space-between' }}
                  >
                    <div style={{ width: '48%' }}>
                      <h3>Incoming</h3>
                      <ResourceLinksContainer
                        self={getMetadataFromExpandedResource(resource)._self}
                        rev={getMetadataFromExpandedResource(resource)._rev}
                        direction="incoming"
                        onClick={handleGoToInternalLink}
                      />
                    </div>
                    <div style={{ width: '48%' }}>
                      <h3>Outgoing</h3>
                      <ResourceLinksContainer
                        self={getMetadataFromExpandedResource(resource)._self}
                        rev={getMetadataFromExpandedResource(resource)._rev}
                        direction="outgoing"
                        onClick={handleGoToInternalLink}
                      />
                    </div>
                  </div>
                </TabPane>
              </Tabs>
            </>
          )}
        </Spin>
      </div>
    </div>
  );
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    goToResource: (
      orgLabel: string,
      projectLabel: string,
      resourceId: string,
      opt: {
        revision?: number;
        tab?: string;
      }
    ) => {
      const { revision, tab } = opt;
      dispatch(
        push(
          `/${orgLabel}/${projectLabel}/resources/${resourceId}${
            revision ? `?rev=${revision}` : ''
          }${tab ? tab : ''}`
        )
      );
    },
    goToProject: (orgLabel: string, projectLabel: string) =>
      dispatch(push(`/${orgLabel}/${projectLabel}`)),
    goToOrg: (orgLabel: string) => dispatch(push(`/${orgLabel}`)),
  };
};

export default connect(
  null,
  mapDispatchToProps
)(ResourceView);
