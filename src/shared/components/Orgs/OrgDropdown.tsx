import * as React from 'react';
import { Button, Icon, Popover, Spin } from 'antd';
import OrgList from './OrgList';
import { ListCardProps } from '../Animations/ListCardComponent';

export interface OrgDropDownProps {
  activeName?: string;
  orgs?: ListCardProps[];
  key?: any;
  busy?: boolean;
  error?: { message: string; name: string };
  onRefreshClick?(): any;
  onCreateNewClick?(): any;
  onExploreAllClick?(): any;
}

const OrgDropdown: React.FunctionComponent<OrgDropDownProps> = ({
  activeName,
  orgs = [],
  key = '',
  busy = false,
  error,
  onRefreshClick = () => {},
  onCreateNewClick = () => {},
  onExploreAllClick = () => {},
}) => {
  const [selected, setSelected] = React.useState(activeName);

  const handleOrgSelected = (name: string) => {
    setSelected(name);
  };

  const overlay = (
    <Spin spinning={busy}>
      <div className="OrgDropdownPopover">
        <OrgList
          orgs={orgs}
          onOrgClick={name => handleOrgSelected(name)}
          error={error}
        />
        <div className="org-menu">
          <Button type="primary" onClick={onCreateNewClick}>
            Create New
          </Button>
        </div>
      </div>
    </Spin>
  );
  return (
    <Popover
      openClassName="dropdown-open"
      placement="bottom"
      trigger="click"
      content={overlay}
      key={key}
    >
      <div className="OrgDropdown">
        {selected ? (
          <a className="menu-dropdown ant-dropdown-link">
            <Icon type="home" /> {selected}
          </a>
        ) : (
          <a className="menu-dropdown ant-dropdown-link">
            Select an organization
            <Icon type="down" />
          </a>
        )}
      </div>
    </Popover>
  );
};

export default OrgDropdown;
