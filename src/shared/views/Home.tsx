import * as React from 'react';
import { connect } from 'react-redux';
import { Project } from 'nexus-sdk';
import { RootState } from '../store/reducers';
import { fetchOrg } from '../store/actions/orgs';

interface HomeProps {
  projects: Project[];
  fetchOrg(name: string): void;
  match: any;
}

const Home: React.SFC<HomeProps> = ({ projects, fetchOrg, match }) => {
  React.useEffect(
    () => {
      fetchOrg(match.params.owner);
    },
    [match.params.owner, projects.length]
  );

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
  projects:
    (state.orgs && state.orgs.activeOrg && state.orgs.activeOrg.projects) || [],
});

const mapDispatchToProps = (dispatch: any) => ({
  fetchOrg: (name: string) => dispatch(fetchOrg(name)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Home);
