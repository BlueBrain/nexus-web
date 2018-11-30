import * as React from 'react';
import { Dispatch } from 'redux';
import { connect } from 'react-redux';
import { push } from 'connected-react-router';
import { RootState } from '../store/reducers';
import OrgList from '../components/Orgs/OrgList';
import { OrgCardProps } from '../components/Orgs/OrgCard';
import { fetchOrgs } from '../store/actions/nexus';
import Skeleton from '../components/Skeleton';

interface LandingProps {
  orgs: OrgCardProps[];
  busy: boolean;
  goToProject(name: string): void;
  fetchOrgs(): void;
}

const Landing: React.SFC<LandingProps> = ({
  orgs,
  busy,
  goToProject,
  fetchOrgs,
}) => {
  React.useEffect(() => {
    orgs.length === 0 && fetchOrgs();
  }, []);

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

  return orgs.length === 0 ? (
    <p style={{ marginTop: 50 }}>No organizations yet...</p>
  ) : (
    <OrgList orgs={orgs} onOrgClick={goToProject} />
  );
};

const mapStateToProps = (state: RootState) => ({
  orgs:
    (state.nexus &&
      state.nexus.orgs.map(o => ({ name: o.label, projectNumber: 0 }))) ||
    [],
  busy: (state.nexus && state.nexus.fetching) || false,
});

const mapDispatchToProps = (dispatch: any) => ({
  goToProject: (org: string) => dispatch(push(`/${org}`)),
  fetchOrgs: () => dispatch(fetchOrgs()),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Landing);
