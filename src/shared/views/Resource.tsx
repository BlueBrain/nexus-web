import * as React from 'react';
import { connect } from 'react-redux';
import { RootState } from '../store/reducers';
import { fetchAndAssignResource } from '../store/actions/nexus/resource';
import { Resource, PaginationSettings, NexusFile } from '@bbp/nexus-sdk';
import ResourceView from '../components/Resources/ResourceDetails';
import Helmet from 'react-helmet';
import Status from '../components/Routing/Status';
import {
  HTTP_STATUSES,
  HTTP_STATUS_TYPE_KEYS,
} from '../store/actions/utils/statusCodes';
import { RequestError } from '../store/actions/utils/errors';
import { push } from 'connected-react-router';
import { fetchLinks, LinkDirection } from '../store/actions/nexus/links';
import { LinksState } from '../store/reducers/links';

interface ResourceViewProps {
  linksListPageSize: number;
  match: any;
  resource: Resource | null;
  dotGraph: string | null;
  error: RequestError | null;
  isFetching: boolean | false;
  goToResource: (resource: Resource) => void;
  getFilePreview: (selfUrl: string) => Promise<NexusFile>;
  links: LinksState | null;
  fetchLinks: (
    resource: Resource,
    linkDirection: LinkDirection,
    paginationSettings: PaginationSettings
  ) => void;
  fetchResource: (
    orgLabel: string,
    projectLabel: string,
    resourceId: string,
    expanded?: boolean
  ) => void;
}

const ResourceViewPage: React.FunctionComponent<ResourceViewProps> = props => {
  const {
    match,
    resource,
    error,
    isFetching,
    fetchResource,
    dotGraph,
    links,
    goToResource,
    fetchLinks,
    linksListPageSize,
    getFilePreview,
  } = props;
  const fetch = (expanded = false) => {
    fetchResource(
      match.params.org,
      match.params.project,
      match.params.resourceId,
      expanded
    );
  };
  // Fetch Resource
  React.useEffect(() => {
    fetch();
  }, [match.params.resourceId]);

  return (
    <div className="resource-view">
      {!!resource && <Helmet title={resource.name} />}
      <Status
        code={
          !!error ? error.code : HTTP_STATUSES[HTTP_STATUS_TYPE_KEYS.OK].code
        }
      >
        <ResourceView
          getFilePreview={getFilePreview}
          goToResource={goToResource}
          links={links}
          dotGraph={dotGraph}
          onSuccess={fetch}
          resource={resource}
          error={error}
          isFetching={isFetching}
          fetchLinks={fetchLinks}
          linksListPageSize={linksListPageSize}
          fetchResource={fetch}
        />
      </Status>
    </div>
  );
};

const mapStateToProps = (state: RootState) => ({
  linksListPageSize: state.uiSettings.pageSizes.linksListPageSize,
  dotGraph:
    (state.nexus &&
      state.nexus.activeResource &&
      state.nexus.activeResource.data &&
      state.nexus.activeResource.data.dotGraph) ||
    null,
  resource:
    (state.nexus &&
      state.nexus.activeResource &&
      state.nexus.activeResource.data &&
      state.nexus.activeResource.data.resource) ||
    null,
  links: (state.nexus && state.nexus.links) || null,
  error:
    (state.nexus &&
      state.nexus.activeResource &&
      state.nexus.activeResource.error) ||
    null,
  isFetching:
    (state.nexus &&
      state.nexus.activeResource &&
      state.nexus.activeResource.isFetching) ||
    false,
});
const mapDispatchToProps = (dispatch: any) => {
  return {
    getFilePreview: (selfUrl: string) => NexusFile.getSelf(selfUrl, true),
    goToResource: (resource: Resource) =>
      dispatch(
        push(
          `/${resource.orgLabel}/${
            resource.projectLabel
          }/resources/${encodeURIComponent(resource.id)}`
        )
      ),
    fetchResource: (
      orgLabel: string,
      projectLabel: string,
      id: string,
      expanded = false
    ) => {
      dispatch(fetchAndAssignResource(orgLabel, projectLabel, id, expanded));
    },
    fetchLinks: (
      resource: Resource,
      linkDirection: LinkDirection,
      paginationSettings: PaginationSettings
    ) => {
      dispatch(fetchLinks(resource, linkDirection, paginationSettings));
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ResourceViewPage);
