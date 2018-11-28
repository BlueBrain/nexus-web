import * as React from 'react';
import { Dispatch } from 'redux';
import { connect } from 'react-redux';
import { push } from 'connected-react-router';
import { RootState } from '../store/reducers';
import OrgList from '../components/Orgs/OrgList';
import { OrgCardProps } from '../components/Orgs/OrgCard';
import { fetchOrgs } from '../store/actions/orgs';

interface LandingProps {
  orgs: OrgCardProps[];
  goToProject(name: string): void;
  fetchOrgs(): void;
}

const Landing: React.SFC<LandingProps> = ({ orgs, goToProject, fetchOrgs }) => {
  React.useEffect(() => {
    orgs.length === 0 && fetchOrgs();
  }, []);

  return orgs.length === 0 ? (
    <p style={{ marginTop: 50 }}>No organizations yet...</p>
  ) : (
    <OrgList orgs={orgs} onOrgClick={goToProject} />
  );
};

const mapStateToProps = (state: RootState) => ({
  orgs:
    (state.orgs &&
      state.orgs.orgs.map(o => ({ name: o.label, projectNumber: 0 }))) ||
    [],
});

const mapDispatchToProps = (dispatch: any) => ({
  goToProject: (org: string) => dispatch(push(`/${org}`)),
  fetchOrgs: () => dispatch(fetchOrgs()),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Landing);
