import * as React from 'react';
import { connect } from 'react-redux';
import { Empty, Spin } from 'antd';
import { ACL } from '@bbp/nexus-sdk-legacy';
import { RootState } from '../store/reducers';
import { fetchAcls } from '../store/actions/auth';
import ACLsForm from '../components/ACLs/ACLsForm';

interface ACLsViewProps {
  acls?: ACL[];
  error?: { message: string; name: string };
  busy?: boolean;
  match: any;
  fetchACLData(orgLabel: string, projectLabel: string): void;
}
const ACLs: React.FunctionComponent<ACLsViewProps> = ({
  acls,
  error,
  match,
  busy = false,
  fetchACLData,
}) => {
  React.useEffect(() => {
    if (!busy) {
      fetchACLData(match.params.org, match.params.project);
    }
  }, [match.params.project, match.params.org]);

  if (busy) {
    return <Spin tip="Loading ACLs..." />;
  }
  if (error) {
    return (
      <Empty
        style={{ marginTop: '22vh' }}
        description={<span>Error while retrieving ALCs: {error.message}</span>}
      />
    );
  }
  if (!acls) {
    return (
      <Empty
        style={{ marginTop: '22vh' }}
        description={'No ACLs to display...'}
      />
    );
  }
  return <ACLsForm acls={acls} />;
};

const mapStateToProps = (state: RootState) => ({
  acls:
    (state.auth.acls &&
      state.auth.acls &&
      state.auth.acls.data &&
      state.auth.acls.data.results) ||
    undefined,
  busy: state.auth.acls && state.auth.acls && state.auth.acls.isFetching,
  error:
    (state.auth.acls && state.auth.acls && state.auth.acls.error) || undefined,
});

const mapDispatchToProps = (dispatch: any) => ({
  fetchACLData: (orgLabel: string, projectLabel: string) =>
    dispatch(fetchAcls(`${orgLabel}/${projectLabel}`, { ancestors: true })),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ACLs);
