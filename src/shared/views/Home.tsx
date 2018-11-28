import * as React from 'react';
import { connect } from 'react-redux';
import { Project } from '@bbp/nexus-sdk';
import { RootState } from '../store/reducers';
import { fetchOrg } from '../store/actions/orgs';

interface HomeProps {
  activeOrg: { label: string };
  projects: Project[];
  busy: boolean;
  fetchOrg(name: string): void;
  match: any;
}

const Home: React.SFC<HomeProps> = ({
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
    return null;
  }
  if (projects.length === 0) {
    return <p>no projects</p>;
  }
  return (
    <ul>
      {projects.map(p => (
        <li key={p.id}>{p.name}</li>
      ))}
    </ul>
  );
};

const mapStateToProps = (state: RootState) => ({
  activeOrg: (state.orgs &&
    state.orgs.activeOrg &&
    state.orgs.activeOrg.org) || { label: '' },
  projects:
    state.orgs && state.orgs.activeOrg && state.orgs.activeOrg.projects
      ? state.orgs.activeOrg.projects
      : [],
  busy: (state.orgs && state.orgs.fetching) || false,
});

const mapDispatchToProps = (dispatch: any) => ({
  fetchOrg: (name: string) => dispatch(fetchOrg(name)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Home);
