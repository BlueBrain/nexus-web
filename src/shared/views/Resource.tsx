import * as React from 'react';
import { connect } from 'react-redux';
import { RootState } from '../store/reducers';
import {
  fetchAndAssignResource,
  deprecateResource,
} from '../store/actions/nexus/resource';
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
import { listRevisions, Revisions } from '../store/actions/nexus/revisions';

interface ResourceViewProps {
  linksListPageSize: number;
  match: any;
  resource: Resource | null;
  dotGraph: string | null;
  error: RequestError | null;
  isFetching: boolean | false;
  goToOrg: (resource: Resource) => void;
  goToProject: (resource: Resource) => void;
  goToResource: (resource: Resource) => void;
  goToSparqlView: (resource: Resource) => void;
  deprecateResource: (resource: Resource) => void;
  goToElasticSearchView: (resource: Resource) => void;
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
  listRevisions(resource: Resource): Promise<Revisions>;
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
    goToOrg,
    goToProject,
    goToResource,
    goToSparqlView,
    goToElasticSearchView,
    fetchLinks,
    linksListPageSize,
    getFilePreview,
    deprecateResource,
    listRevisions,
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
    <div className="resource-view view-container">
      {!!resource && <Helmet title={resource.name} />}
      <Status
        code={
          !!error ? error.code : HTTP_STATUSES[HTTP_STATUS_TYPE_KEYS.OK].code
        }
      >
        <ResourceView
          deprecateResource={deprecateResource}
          goToElasticSearchView={goToElasticSearchView}
          goToSparqlView={goToSparqlView}
          getFilePreview={getFilePreview}
          goToOrg={goToOrg}
          goToProject={goToProject}
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
          listRevisions={listRevisions}
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
    getFilePreview: (selfUrl: string) =>
      NexusFile.getSelf(selfUrl, { shouldFetchFile: true }),
    goToProject: (resource: Resource) =>
      dispatch(push(`/${resource.orgLabel}/${resource.projectLabel}`)),
    goToOrg: (resource: Resource) => dispatch(push(`/${resource.orgLabel}`)),
    goToResource: (resource: Resource) =>
      dispatch(
        push(
          `/${resource.orgLabel}/${
            resource.projectLabel
          }/resources/${encodeURIComponent(resource.raw['@id'])}`
        )
      ),
    goToSparqlView: (resource: Resource) =>
      dispatch(
        push(
          `/${resource.orgLabel}/${resource.projectLabel}/${encodeURIComponent(
            resource.raw['@id']
          )}/sparql`
        )
      ),
    goToElasticSearchView: (resource: Resource) =>
      dispatch(
        push(
          `/${resource.orgLabel}/${resource.projectLabel}/${encodeURIComponent(
            resource.raw['@id']
          )}/_search`
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
    deprecateResource: (resource: Resource) =>
      dispatch(deprecateResource(resource)),
    fetchLinks: (
      resource: Resource,
      linkDirection: LinkDirection,
      paginationSettings: PaginationSettings
    ) => {
      dispatch(fetchLinks(resource, linkDirection, paginationSettings));
    },
    listRevisions: (resource: Resource) => dispatch(listRevisions(resource)),
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ResourceViewPage);
