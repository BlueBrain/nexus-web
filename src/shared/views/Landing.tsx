import * as React from 'react';
import { connect } from 'react-redux';
import { push } from 'connected-react-router';
import { RootState } from '../store/reducers';
import OrgList from '../components/Orgs/OrgList';
import { OrgCardProps } from '../components/Orgs/OrgCard';
import { Dispatch } from 'redux';

interface LandingProps {
  orgs: OrgCardProps[];
  goToProject(name: string): void;
}

const Landing: React.SFC<LandingProps> = ({ orgs, goToProject }) =>
  orgs.length === 0 ? (
    <p style={{ marginTop: 50 }}>No organizations yet...</p>
  ) : (
    <OrgList orgs={orgs} onOrgClick={goToProject} />
  );

const mapStateToProps = (state: RootState) => ({
  orgs:
    (state.orgs &&
      state.orgs.orgs.map(o => ({ name: o.label, projectNumber: 0 }))) ||
    [],
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  goToProject: (owner: string) => dispatch(push(`/${owner}`)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Landing);
