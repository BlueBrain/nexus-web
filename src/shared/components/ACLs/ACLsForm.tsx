import * as React from 'react';
import { Tabs } from 'antd';
import { ACL } from '@bbp/nexus-sdk';
import ACLView from './ACLView';

import './ACLs.less';

interface ACLsFormProps {
  acls: ACL[];
  path: string;
  permissionList?: [];
}
const ACLsForm: React.FunctionComponent<ACLsFormProps> = (
  props: ACLsFormProps
) => {
  return (
    <Tabs defaultActiveKey={`${props.path}-0`} className="ACLs-form">
      {props.acls.map((acl: ACL, index: number) => (
        <Tabs.TabPane
          tab={
            <p>
              Permissions applied to: <span>{acl.path}</span>
            </p>
          }
          key={`${props.path}-${index}`}
        >
          {acl.acl.map(a => (
            <ACLView
              identity={a.identity}
              permissions={a.permissions}
              key={`${props.path}-${acl.path}-${JSON.stringify(a.identity)}`}
            />
          ))}
        </Tabs.TabPane>
      ))}
    </Tabs>
  );
};

export default ACLsForm;
