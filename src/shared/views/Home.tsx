import * as React from 'react';
import { connect } from 'react-redux';
import { Drawer } from 'antd';
import { RootState } from '../store/reducers';
import { fetchProjects } from '../store/actions/nexus';
import ProjectList from '../components/Projects/ProjectList';
import Skeleton from '../components/Skeleton';
import { ProjectCardProps } from '../components/Projects/ProjectCard';
import { push } from 'connected-react-router';
import ProjectForm from '../components/Projects/ProjectForm';

interface HomeProps {
  activeOrg: { label: string };
  projects: ProjectCardProps[];
  busy: boolean;
  match: any;
  fetchProjects(name: string): void;
  goTo(o: string, p: string): void;
}

const Home: React.FunctionComponent<HomeProps> = ({
  busy,
  projects,
  match,
  activeOrg,
  fetchProjects,
  goTo,
}) => {
  const [selectedProject, setSelectedProject] = React.useState<
    ProjectCardProps | undefined
  >(undefined);

  React.useEffect(
    () => {
      if (activeOrg.label !== match.params.org) {
        fetchProjects(match.params.org);
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
  return (
    <>
      <ProjectList
        projects={projects}
        onProjectClick={(projectLabel: string) =>
          goTo(activeOrg.label, projectLabel)
        }
        onProjectEdit={(projectLabel: string) =>
          setSelectedProject(projects.filter(p => p.label === projectLabel)[0])
        }
      />
      <Drawer
        width={640}
        visible={!!(selectedProject && selectedProject.name)}
        onClose={() => setSelectedProject(undefined)}
      >
        {selectedProject && (
          <ProjectForm
            project={{
              name: selectedProject.name,
              label: selectedProject.label,
            }}
          />
        )}
      </Drawer>
    </>
  );
};

const mapStateToProps = (state: RootState) => ({
  activeOrg: (state.nexus &&
    state.nexus.activeOrg &&
    state.nexus.activeOrg.org) || { label: '' },
  projects:
    state.nexus && state.nexus.activeOrg && state.nexus.activeOrg.projects
      ? state.nexus.activeOrg.projects.map(p => ({
          name: p.name,
          label: p.label,
          resourceNumber: p.resourceNumber,
        }))
      : [],
  busy:
    (state.nexus &&
      (state.nexus.orgsFetching || state.nexus.projectsFetching)) ||
    false,
});

const mapDispatchToProps = (dispatch: any) => ({
  fetchProjects: (name: string) => dispatch(fetchProjects(name)),
  goTo: (org: string, project: string) => dispatch(push(`/${org}/${project}`)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Home);
