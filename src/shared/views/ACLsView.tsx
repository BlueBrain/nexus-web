import * as React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Empty, Spin, Tooltip, Icon } from 'antd';
import { push } from 'connected-react-router';
import { ACL } from '@bbp/nexus-sdk';
import { useNexusContext } from '@bbp/react-nexus';

import ACLsForm from '../components/ACLs/ACLsForm';

interface ACLsViewProps {
  match: any;
}
const ACLs: React.FunctionComponent<ACLsViewProps> = ({ match }) => {
  const {
    params: { orgLabel, projectLabel },
  } = match;
  const path = `${orgLabel}${projectLabel ? `/${projectLabel}` : ''}`;

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
      nexus.ACL.list(path, { ancestors: true, self: false })
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
  }, [orgLabel, projectLabel]);

  return (
    <div className="acl-view view-container">
      <div style={{ flexGrow: 1 }}>
        <h1 className="name">
          <span>
            <Link to="/">
              <Tooltip title="Back to all organizations" placement="right">
                <Icon type="home" />
              </Tooltip>
            </Link>
            {' | '}
            <Link to={`/${orgLabel}`}>{orgLabel}</Link>
            {' | '}
            <Link to={`/${orgLabel}/${projectLabel}`}>{projectLabel}</Link>
          </span>
        </h1>
        {busy && <Spin tip="Loading ACLs..." />}
        {error && (
          <Empty
            style={{ marginTop: '22vh' }}
            description={
              <span>Error while retrieving ALCs: {error.message}</span>
            }
          />
        )}
        {!acls ||
          (acls.length === 0 && (
            <Empty
              style={{ marginTop: '22vh' }}
              description={'No ACLs to display...'}
            />
          ))}
        {acls && <ACLsForm acls={acls} path={path} />}
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
