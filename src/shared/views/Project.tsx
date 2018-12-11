import * as React from 'react';
import { connect } from 'react-redux';
import { RootState } from '../store/reducers';
import { fetchResources } from '../store/actions/nexus';
import ResourceList from '../components/Resources/ResourceList';
import { ResourceItemProps } from '../components/Resources/ResourceItem';
import Skeleton from '../components/Skeleton';

interface ProjectViewProps {
  orgLabel: string;
  projectLabel: string;
  busy: boolean;
  resources: ResourceItemProps[];
  fetchResources(org: string, project: string): void;
  match: any;
}

const ProjectView: React.FunctionComponent<ProjectViewProps> = ({
  orgLabel,
  projectLabel,
  busy,
  resources,
  fetchResources,
  match,
}) => {
  React.useEffect(
    () => {
      if (
        orgLabel !== match.params.org ||
        projectLabel !== match.params.project
      ) {
        fetchResources(match.params.org, match.params.project);
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
  if (resources.length === 0) {
    return <p>no resources</p>;
  }
  return (
    <React.Fragment>
      <ResourceList resources={resources} loading={false} />
    </React.Fragment>
  );
};

const mapStateToProps = (state: RootState) => ({
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
  resources:
    (state.nexus &&
      state.nexus.activeProject &&
      state.nexus.activeProject.resources) ||
    [],
  busy:
    (state.nexus &&
      (state.nexus.projectsFetching || state.nexus.resourcesFetching)) ||
    false,
});

const mapDispatchToProps = (dispatch: any) => ({
  fetchResources: (org: string, project: string) =>
    dispatch(fetchResources(org, project)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ProjectView);
