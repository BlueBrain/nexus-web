import './ACLs.scss';

import { ACL } from '@bbp/nexus-sdk/es';
import { Tabs } from 'antd';
import * as React from 'react';

import ACLCard from './ACLCard';

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
      items={props.acls.map((acl: ACL, index: number) => ({
        key: `${props.path}-${index}`,
        label: (
          <p>
            Permissions applied to: <span>{acl._path}</span>
          </p>
        ),
        children:
          acl.acl &&
          acl.acl.map(a => (
            <ACLCard
              identity={a.identity}
              permissions={a.permissions}
              key={`${props.path}-${acl._path}-${JSON.stringify(a.identity)}`}
            />
          )),
      }))}
    />
  );
};

export default ACLsForm;
