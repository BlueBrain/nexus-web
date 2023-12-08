import './ACLs.scss';

import { CrownOutlined, GlobalOutlined, TeamOutlined, UserOutlined } from '@ant-design/icons';
import { Identity } from '@bbp/nexus-sdk/es';
import { Tooltip } from 'antd';
import * as React from 'react';

const getTitle = (identity: Identity): React.ReactElement<any> => {
  switch (identity['@type']) {
    case 'Anonymous':
      return (
        <Tooltip title={`Anyone with the internet has the following permissions`}>
          <GlobalOutlined /> Anonymous
        </Tooltip>
      );
    case 'Authenticated':
      return (
        <Tooltip
          title={`Users authenticated through the realm ${identity.realm} have the following permissions`}
        >
          <CrownOutlined /> Authenticated to:{' '}
          <span className="Identity-badge_role">{identity.realm}</span>
        </Tooltip>
      );
    case 'Group':
      return (
        <Tooltip
          title={`Users who are part of the group ${identity.group} have the following permissions`}
        >
          <TeamOutlined /> Part of group:{' '}
          <span className="Identity-badge_role">{identity.group}</span>
        </Tooltip>
      );
    case 'User':
      return (
        <Tooltip title={`User ${identity.subject} has the following permissions`}>
          <UserOutlined /> User: <span className="Identity-badge_role">{identity.subject}</span>
        </Tooltip>
      );
    default:
      return <></>;
  }
};

const IdentityBadge: React.FunctionComponent<Identity> = (props) => {
  return (
    <div className="Identity-badge">
      <h2>{getTitle(props)}</h2>
    </div>
  );
};

export default IdentityBadge;
