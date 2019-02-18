import * as React from 'react';
import { Checkbox, Divider } from 'antd';

import './ACLs.less';
import { Identity } from '@bbp/nexus-sdk/lib/ACL/types';
import IdentityBadge from './IdentityBadge';

interface ACLViewProp {
  identity: Identity;
  permissions: string[];
}
const ACLView: React.FunctionComponent<ACLViewProp> = props => {
  return (
    <div>
      <IdentityBadge {...props.identity} />
      <h4>Project</h4>
      <Checkbox.Group
        options={['project/read', 'project/write', 'project/create']}
      />
      <h4>Project</h4>
      <Checkbox.Group
        options={['project/read', 'project/write', 'project/create']}
      />
      <h4>Project</h4>
      <Checkbox.Group
        options={['project/read', 'project/write', 'project/create']}
      />
      <h4>Project</h4>
      <Checkbox.Group
        options={['project/read', 'project/write', 'project/create']}
      />
    </div>
  );
};

export default ACLView;
