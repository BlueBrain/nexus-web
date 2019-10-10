import * as React from 'react';
import { connect } from 'react-redux';
import { Empty, Spin } from 'antd';
import { push } from 'connected-react-router';
import { useNexusContext } from '@bbp/react-nexus';

import ACLsForm from '../components/ACLs/ACLsForm';
import { ACL } from '@bbp/nexus-sdk';

interface ACLsViewProps {
  match: any;
  goToOrg(orgLabel: string): void;
  goToProject(orgLabel: string, projectLabel: string): void;
}
const ACLs: React.FunctionComponent<ACLsViewProps> = ({
  match,
  goToOrg,
  goToProject,
}) => {
  const path = `${match.params.org}${
    match.params.project ? `/${match.params.project}` : ''
  }`;

  const [{ busy, error, acls }, setACLs] = React.useState<{
    busy: Boolean;
    error: Error | null;
    acls: ACL[] | null;
  }>({
    busy: false,
    error: null,
    acls: null,
  });

  const nexus = useNexusContext();

  React.useEffect(() => {
    if (!busy) {
      setACLs({
        error: null,
        acls: null,
        busy: true,
      });
      nexus.ACL.list(path)
        .then(acls => {
          setACLs({
            acls: acls._results,
            busy: false,
            error: null,
          });
        })
        .catch(error => {
          setACLs({
            error,
            acls: null,
            busy: false,
          });
        });
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

  return (
    <div className="acl-view view-container">
      <div style={{ flexGrow: 1 }}>
        <h1 className="name">
          <span>
            <a onClick={() => goToOrg(match.params.org)}>{match.params.org}</a>{' '}
            |{' '}
            <a
              onClick={() =>
                goToProject(match.params.org, match.params.project)
              }
            >
              {match.params.project}
            </a>{' '}
          </span>
        </h1>
        <ACLsForm acls={acls} path={path} />
      </div>
    </div>
  );
};

const mapDispatchToProps = (dispatch: any) => ({
  goToOrg: (orgLabel: string) => dispatch(push(`/${orgLabel}`)),
  goToProject: (orgLabel: string, projectLabel: string) =>
    dispatch(push(`/${orgLabel}/${projectLabel}`)),
});

export default connect(
  null,
  mapDispatchToProps
)(ACLs);
