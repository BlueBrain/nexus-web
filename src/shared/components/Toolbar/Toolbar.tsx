import * as React from 'react';
import RenameableItem from '../Renameable';

import './Toolbar.less';
import { Dropdown, Menu, Icon, Avatar, Button } from 'antd';
import { Identity } from '@bbp/nexus-sdk/lib/ACL/types';

interface ToolbarProps {
  projectName: string;
  onProjectNameChange: (name: string) => any;
  identities: Identity[];
}
const Toolbar: React.FunctionComponent<ToolbarProps> = props => {
  const menu = (
    <Menu className="Toolbar-permission-menu">
      <h3 className="title">Change permissions</h3>
      <Menu.Divider />
      <Menu.Item key="0">
        <div className="permission-item">
          <Icon type="lock" style={{ color: 'red' }} />
          <span className="permission-name">Private</span>
          <Icon type="check" />
        </div>
        <p>Only project members can access this project.</p>
      </Menu.Item>
      <Menu.Item key="1">
        <div className="permission-item">
          <Icon type="team" />
          <span className="permission-name">Group</span>
        </div>
        <p>All members of the group can see and edit the project.</p>
      </Menu.Item>
      <Menu.Item key="3">
        <div className="permission-item">
          <Icon type="global" style={{ color: 'green' }} />
          <span className="permission-name">Public</span>
        </div>
        <p>
          Anyone on the internet can see this project. Only project members can
          edit it.
        </p>
      </Menu.Item>
    </Menu>
  );
  return (
    <div className="Toolbar">
      <RenameableItem
        defaultValue={props.projectName}
        onChange={props.onProjectNameChange}
      />
      <span className="divider" />
      <div className="status">
        <Button type="ghost">Private</Button>
      </div>
      <span className="divider" />
      <Dropdown overlay={menu} trigger={['click']}>
        <Button type="primary" icon="lock">
          Personal
        </Button>
      </Dropdown>
      <span className="divider" />
      <div className="members">
        <Avatar style={{ color: 'black' }}>machon</Avatar>
      </div>
      <span className="divider" />
      <Button type="primary" shape="circle" icon="user-add" />
    </div>
  );
};

export default Toolbar;
