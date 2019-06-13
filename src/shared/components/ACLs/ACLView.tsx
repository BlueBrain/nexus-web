import * as React from 'react';
import { Checkbox, Divider, List } from 'antd';

import './ACLs.less';
import { Identity } from '@bbp/nexus-sdk-legacy/lib/ACL/types';
import IdentityBadge from './IdentityBadge';

type GroupedPermission = {
  name: string;
  permissions: string[];
};
function groupPermissions(permissions: string[]): GroupedPermission[] {
  return permissions.reduce<GroupedPermission[]>((prev, curr) => {
    // permission format is xxx/yyy
    const s = curr.split('/');
    // do we have s[0] already?
    if (!prev.some(group => group.name === s[0])) {
      // no, add it
      return [...prev, { name: s[0], permissions: [s[1]] }];
    }
    return prev.map(group => {
      if (group.name === s[0]) {
        return { name: group.name, permissions: [...group.permissions, s[1]] };
      }
      return group;
    });
  }, []);
}

interface ACLViewProp {
  identity: Identity;
  permissions: string[];
}
const ACLView: React.FunctionComponent<ACLViewProp> = props => {
  return (
    <div>
      <IdentityBadge {...props.identity} />
      <List
        grid={{
          gutter: 16,
          xs: 1,
          sm: 2,
          md: 4,
          lg: 4,
          xl: 6,
          xxl: 3,
        }}
        dataSource={groupPermissions(props.permissions)}
        renderItem={(group: GroupedPermission) => (
          <List.Item className="permissions">
            <p className="name">{group.name}</p>
            <Checkbox.Group
              options={group.permissions}
              defaultValue={group.permissions}
              disabled
            />
            <Divider />
          </List.Item>
        )}
      />
    </div>
  );
};

export default ACLView;
