import * as React from 'react';
import { Icon, Tooltip } from 'antd';
import { Identity } from '@bbp/nexus-sdk/lib/ACL/types';

import './ACLs.less';

const getTitle = (identity: Identity): React.ReactElement<any> => {
  switch (identity['@type']) {
    case 'Anonymous':
      return (
        <Tooltip title="Anyone with the internet">
          <Icon type="global" />
        </Tooltip>
      );
    case 'Authenticated':
      return (
        <Tooltip title={identity.realm}>
          <Icon type="crown" />
        </Tooltip>
      );
    case 'Group':
      return (
        <Tooltip title={identity.group}>
          <Icon type="team" />
        </Tooltip>
      );
    case 'User':
      return (
        <Tooltip title={identity.subject}>
          <Icon type="user" />
        </Tooltip>
      );
    default:
      return <Icon />;
  }
};

const IdentityBadge: React.FunctionComponent<Identity> = props => {
  return (
    <div className="Identity-badge">
      <h3>
        {getTitle(props)} {props['@type']}
      </h3>
    </div>
  );
};

export default IdentityBadge;
