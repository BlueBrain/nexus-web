import * as React from 'react';
import { Button, Icon, Popover } from 'antd';
import { OrgCardProps } from './OrgCard';
import OrgList from './OrgList';
import { any } from 'prop-types';

export interface OrgDropDownProps {
  activeName?: string;
  orgs?: OrgCardProps[];
  key?: any;
  onRefreshClick?(): any;
  onCreateNewClick?(): any;
  onExploreAllClick?(): any;
}

const OrgDropdown: React.FunctionComponent<OrgDropDownProps> = ({
  activeName,
  orgs = [],
  key = '',
  onRefreshClick = () => {},
  onCreateNewClick = () => {},
  onExploreAllClick = () => {},
}) => {
  const [selected, setSelected] = React.useState(activeName);

  const handleOrgSelected = (name: string) => {
    setSelected(name);
  };

  const overlay = (
    <div className="OrgDropdownPopover">
      <a style={{ float: 'right' }} onClick={onRefreshClick}>
        refresh <Icon type="redo" />
      </a>
      <OrgList orgs={orgs} onOrgClick={name => handleOrgSelected(name)} />
      <div className="org-menu">
        <Button type="primary" onClick={onCreateNewClick}>
          Create New
        </Button>
        <Button onClick={onExploreAllClick}>Explore All</Button>
      </div>
    </div>
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
