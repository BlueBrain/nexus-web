import * as React from 'react';
import { Identity } from '@bbp/nexus-sdk/lib/ACL/types';

import './ACLs.less';
import { Icon } from 'antd';

const getIcon = (
  activePermission: Identity['@type']
): React.ReactElement<any> => {
  switch (activePermission) {
    case 'Anonymous':
      return <Icon type="global" />;
    case 'Authenticated':
      return <Icon type="crown" />;
    case 'Group':
      return <Icon type="team" />;
    case 'User':
      return <Icon type="user" />;
    default:
      return <Icon />;
  }
};
const IdentityBadge: React.FunctionComponent<Identity> = props => {
  return (
    <div className="Identity-badge">
      <h3>
        {getIcon(props['@type'])} {props['@type']}
      </h3>
    </div>
  );
};

export default IdentityBadge;
