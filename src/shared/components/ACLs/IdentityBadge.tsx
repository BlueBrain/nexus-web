import * as React from 'react';
import { Identity } from '@bbp/nexus-sdk/lib/ACL/types';

import './ACLs.less';

const IdentityBadge: React.FunctionComponent<Identity> = props => {
  return (
    <div className="Identity-badge">
      <p>{props['@type']}</p>
    </div>
  );
};

export default IdentityBadge;
