import * as React from 'react';
import { PaginatedList, Resource, PaginationSettings } from '@bbp/nexus-sdk';
import { connect } from 'react-redux';
import { RootState } from '../store/reducers';
import { fetchResources } from '../store/actions/nexus';
import ResourceList from '../components/Resources/ResourceList';
import Skeleton from '../components/Skeleton';

interface ProjectViewProps {
  orgLabel: string;
  projectLabel: string;
  busy: boolean;
  resources: PaginatedList<Resource>;
  resourcePaginationSettings: PaginationSettings;
  fetching: boolean;
  fetchResources(
    org: string,
    project: string,
    resourcePaginationSettings: PaginationSettings
  ): void;
  match: any;
}

const ProjectView: React.FunctionComponent<ProjectViewProps> = ({
  orgLabel,
  projectLabel,
  busy,
  resources,
  fetchResources,
  fetching,
  resourcePaginationSettings,
  match,
}) => {

  const onPaginationChange = (page: number, size: number) => {
    const from = size * page;
    fetchResources(match.params.org, match.params.project, {
      from,
      size,
    });
  };

  React.useEffect(
    () => {
      if (
        orgLabel !== match.params.org ||
        projectLabel !== match.params.project
      ) {
        fetchResources(
          match.params.org,
          match.params.project,
          resourcePaginationSettings
        );
      }
    },
    [match.params.org, match.params.project]
  );

  if (busy) {
    return (
      <Skeleton
        itemNumber={10}
        active
        avatar
        paragraph={{
          rows: 0,
        }}
        title={{
          width: '100%',
        }}
      />
    );
  }
  if (resources.total === 0) {
    return <p>no resources</p>;
  }
  return (
    <React.Fragment>
      <ResourceList
        resources={resources}
        loading={fetching}
        paginationChange={onPaginationChange}
        paginationSettings={resourcePaginationSettings}
      />
    </React.Fragment>
  );
};

const mapStateToProps = (state: RootState) => ({
  fetching: !!(state.nexus && state.nexus.resourcesFetching),
  orgLabel:
    (state.nexus &&
      state.nexus.activeProject &&
      state.nexus.activeProject.org.label) ||
    '',
  projectLabel:
    (state.nexus &&
      state.nexus.activeProject &&
      state.nexus.activeProject.project.label) ||
    '',
  resources: (state.nexus &&
    state.nexus.activeProject &&
    state.nexus.activeProject.resources) || { total: 0, results: [] },
  resourcePaginationSettings: (state.nexus &&
    state.nexus.resourcePaginationSettings) || { from: 0, size: 20 },
  busy:
    (state.nexus &&
      (state.nexus.projectsFetching || state.nexus.resourcesFetching)) ||
    false,
});

const mapDispatchToProps = (dispatch: any) => ({
  fetchResources: (
    org: string,
    project: string,
    resourcePaginationSettings: PaginationSettings
  ) => dispatch(fetchResources(org, project, resourcePaginationSettings)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ProjectView);
