import * as React from 'react';
import { connect } from 'react-redux';
import { RootState } from '../store/reducers';
import OrgList from '../components/Orgs/OrgList';
import { OrgCardProps } from '../components/Orgs/OrgCard';

interface HomeProps {
  orgs: OrgCardProps[];
}

const Resources: React.SFC<HomeProps> = ({ orgs }) =>
  orgs.length === 0 ? (
    <p style={{ marginTop: 50 }}>No organizations yet...</p>
  ) : (
    <OrgList orgs={orgs} onOrgClick={name => console.log(name)} />
  );

const mapStateToProps = (state: RootState) => ({
  orgs:
    (state.orgs &&
      state.orgs.orgs.map(o => ({ name: o.name, projectNumber: 0 }))) ||
    [],
});

export default connect(mapStateToProps)(Resources);
