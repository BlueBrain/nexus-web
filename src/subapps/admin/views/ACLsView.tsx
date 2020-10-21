import * as React from 'react';
import { Link, useRouteMatch } from 'react-router-dom';
import { Empty, Spin, Tooltip } from 'antd';
import { ACL } from '@bbp/nexus-sdk';
import { useNexusContext } from '@bbp/react-nexus';

import ACLsForm from '../components/ACLs/ACLsForm';
import { useAdminSubappContext } from '..';
import Icon from '@ant-design/icons/lib/components/Icon';

const ACLs: React.FunctionComponent = () => {
  const { namespace } = useAdminSubappContext();
  const match = useRouteMatch<{ orgLabel: string; projectLabel: string }>(
    `/${namespace}/:orgLabel/:projectLabel`
  );
  const {
    params: { orgLabel, projectLabel },
  } = match || {
    params: {
      orgLabel: '',
      projectLabel: '',
    },
  };
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
            <Link to={`/${namespace}`}>
              <Tooltip title="Back to all organizations" placement="right">
                <Icon type="home" />
              </Tooltip>
            </Link>
            {' | '}
            <Link to={`/${namespace}/${orgLabel}`}>{orgLabel}</Link>
            {' | '}
            <Link to={`/${namespace}/${orgLabel}/${projectLabel}`}>
              {projectLabel}
            </Link>
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

export default ACLs;
