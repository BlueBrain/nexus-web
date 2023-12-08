import { ACL } from '@bbp/nexus-sdk/es';
import { useNexusContext } from '@bbp/react-nexus';
import { Empty, Spin } from 'antd';
import * as React from 'react';
import { useRouteMatch } from 'react-router-dom';

import { useAdminSubappContext } from '..';
import ACLsForm from '../components/ACLs/ACLsForm';

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
    busy: boolean;
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
    <div style={{ flexGrow: 1 }}>
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
  );
};

export default ACLs;
