import * as React from 'react';
import { connect } from 'react-redux';
import { RootState } from '../store/reducers';
import { fetchAcls } from '../store/actions/auth';
import { ACL } from '@bbp/nexus-sdk';

interface ACLsViewProps {
  acls?: ACL[];
}
const ACLs: React.FunctionComponent<ACLsViewProps> = props => <p>ACLs</p>;

const mapStateToProps = (state: RootState) => ({
  acls: state.auth.acls && state.auth.acls.results,
});
const mapDispatchToProps = (dispatch: any) => {
  return {
    fetchACLs: (orgLabel: string, projectLabel: string) =>
      dispatch(fetchAcls(`${orgLabel}/${projectLabel}`, { ancestors: true })),
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ACLs);
