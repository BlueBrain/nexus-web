import * as React from 'react';
import { Tabs } from 'antd';
import { ACL } from '@bbp/nexus-sdk';

import ACLCard from './ACLCard';

import './ACLs.scss';

interface ACLsFormProps {
  acls: ACL[];
  path: string;
  permissionList?: [];
}
const ACLsForm: React.FunctionComponent<ACLsFormProps> = (
  props: ACLsFormProps
) => {
  return (
    <Tabs
      defaultActiveKey={`${props.path}-0`}
      className="ACLs-form"
      tabPosition="left"
    >
      {props.acls.map((acl: ACL, index: number) => (
        <Tabs.TabPane
          tab={
            <p>
              Permissions applied to: <span>{acl._path}</span>
            </p>
          }
          key={`${props.path}-${index}`}
        >
          {acl.acl &&
            acl.acl.map(a => (
              <ACLCard
                identity={a.identity}
                permissions={a.permissions}
                key={`${props.path}-${acl._path}-${JSON.stringify(a.identity)}`}
              />
            ))}
        </Tabs.TabPane>
      ))}
    </Tabs>
  );
};

export default ACLsForm;
