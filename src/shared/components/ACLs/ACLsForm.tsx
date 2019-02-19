import * as React from 'react';
import { Checkbox, Divider, Tabs } from 'antd';
import { ACL } from '@bbp/nexus-sdk';

import './ACLs.less';
import { Identity } from '@bbp/nexus-sdk/lib/ACL/types';
import ACLView from './ACLView';
import IdentityBadge from './IdentityBadge';

interface ACLsFormProps {
  acls: ACL[];
  permissionList?: [];
}
const ACLsForm: React.FunctionComponent<ACLsFormProps> = props => {
  return (
    <Tabs defaultActiveKey="0" className="ACLs-form">
      {props.acls.map((acl, index) => (
        <Tabs.TabPane tab={<span>{acl.path}</span>} key={`${index}`}>
          {acl.acl.map(a => (
            <ACLView
              identity={a.identity}
              permissions={a.permissions}
              key={`${acl.path}-${a.identity}`}
            />
          ))}
        </Tabs.TabPane>
      ))}
    </Tabs>
  );
};

export default ACLsForm;
