import * as React from 'react';
import { Icon, Tooltip } from 'antd';
import { Identity } from '@bbp/nexus-sdk/lib/ACL/types';

import './ACLs.less';

const getTitle = (identity: Identity): React.ReactElement<any> => {
  switch (identity['@type']) {
    case 'Anonymous':
      return (
        <Tooltip
          title={`Anyone with the internet has the following permissions`}
        >
          <Icon type="global" /> Anonymous
        </Tooltip>
      );
    case 'Authenticated':
      return (
        <Tooltip
          title={`Users authenticated through the realm ${
            identity.realm
          } have the following permissions`}
        >
          <Icon type="crown" /> Authenticated to:{' '}
          <span className="Identity-badge_role">{identity.realm}</span>
        </Tooltip>
      );
    case 'Group':
      return (
        <Tooltip
          title={`Users who are part of the group ${
            identity.group
          } have the following permissions`}
        >
          <Icon type="team" /> Part of group:{' '}
          <span className="Identity-badge_role">{identity.group}</span>
        </Tooltip>
      );
    case 'User':
      return (
        <Tooltip
          title={`User ${identity.subject} has the following permissions`}
        >
          <Icon type="user" /> User:{' '}
          <span className="Identity-badge_role">{identity.subject}</span>
        </Tooltip>
      );
    default:
      return <Icon />;
  }
};

const IdentityBadge: React.FunctionComponent<Identity> = props => {
  return (
    <div className="Identity-badge">
      <h2>{getTitle(props)}</h2>
    </div>
  );
};

export default IdentityBadge;
