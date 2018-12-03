import * as React from 'react';
import { connect } from 'react-redux';
import { Project } from '@bbp/nexus-sdk';
import { RootState } from '../store/reducers';
import { fetchOrg } from '../store/actions/nexus';
import ProjectList from '../components/Projects/ProjectList';
import Skeleton from '../components/Skeleton';
import { ProjectCardProps } from '../components/Projects/ProjectCard';

interface HomeProps {
  activeOrg: { label: string };
  projects: ProjectCardProps[];
  busy: boolean;
  fetchOrg(name: string): void;
  match: any;
}

const Home: React.FunctionComponent<HomeProps> = ({
  busy,
  projects,
  fetchOrg,
  match,
  activeOrg,
}) => {
  React.useEffect(
    () => {
      if (activeOrg.label !== match.params.org) {
        fetchOrg(match.params.org);
      }
    },
    [match.params.org]
  );

  if (busy) {
    return (
      <Skeleton
        itemNumber={5}
        active
        avatar
        paragraph={{
          rows: 1,
          width: 0,
        }}
        title={{
          width: '100%',
        }}
      />
    );
  }
  if (projects.length === 0) {
    return <p>no projects</p>;
  }
  return <ProjectList projects={projects} />;
};

const mapStateToProps = (state: RootState) => ({
  activeOrg: (state.nexus &&
    state.nexus.activeOrg &&
    state.nexus.activeOrg.org) || { label: '' },
  projects:
    state.nexus && state.nexus.activeOrg && state.nexus.activeOrg.projects
      ? state.nexus.activeOrg.projects.map(p => ({
          name: p.name,
          resourceNumber: 0,
        }))
      : [],
  busy: (state.nexus && state.nexus.fetching) || false,
});

const mapDispatchToProps = (dispatch: any) => ({
  fetchOrg: (name: string) => dispatch(fetchOrg(name)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Home);
