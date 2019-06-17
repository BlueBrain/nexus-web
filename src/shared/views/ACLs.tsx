import * as React from 'react';
import { connect } from 'react-redux';
import { push } from 'connected-react-router';
import { Empty, Spin } from 'antd';
import { ACL } from '@bbp/nexus-sdk';
import { RootState } from '../store/reducers';
import { fetchAcls } from '../store/actions/auth';
import ACLsForm from '../components/ACLs/ACLsForm';

interface ACLsViewProps {
  acls?: ACL[];
  error?: { message: string; name: string };
  busy?: boolean;
  match: any;
  fetchACLData(orgLabel: string, projectLabel: string): void;
  goToOrg(orgLabel: string): void;
  goToProject(orgLabel: string, projectLabel: string): void;
}
const ACLs: React.FunctionComponent<ACLsViewProps> = ({
  acls,
  error,
  match,
  busy = false,
  fetchACLData,
  goToOrg,
  goToProject,
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
  const path = `${match.params.org}/${match.params.project}`;
  return (
    <div className="acl-view">
      <h1 className="name">
        <span>
          <a onClick={() => goToOrg(match.params.org)}>{match.params.org}</a> |{' '}
          <a
            onClick={() => goToProject(match.params.org, match.params.project)}
          >
            {match.params.project}
          </a>{' '}
        </span>
      </h1>
      <ACLsForm acls={acls} path={path} />
    </div>
  );
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
    dispatch(
      fetchAcls(`${orgLabel}/${projectLabel}`, { ancestors: true, self: false })
    ),
  goToOrg: (orgLabel: string) => dispatch(push(`/${orgLabel}`)),
  goToProject: (orgLabel: string, projectLabel: string) =>
    dispatch(push(`/${orgLabel}/${projectLabel}`)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ACLs);
