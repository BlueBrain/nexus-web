import * as React from 'react';
import { Button, Popover } from 'antd';
import { OrgCardProps } from './OrgCard';
import OrgList from './OrgList';

export interface OrgDropDownProps {
  activeName?: string;
  orgs?: OrgCardProps[];
  key?: any;
}

const OrgDropdown: React.SFC<OrgDropDownProps> = ({
  activeName,
  orgs = [],
}) => {
  const [selected, setSelected] = React.useState(activeName);
  const [visible, setVisible] = React.useState(false);

  const handleOrgSelected = (name: string) => {
    setVisible(false);
    setSelected(name);
  };

  const overlay = (
    <div className="OrgDropdownPopover">
      <OrgList orgs={orgs} onOrgClick={name => handleOrgSelected(name)} />
      <div className="org-menu">
        <Button type="primary">Create New</Button>
        <Button>Explore All</Button>
      </div>
    </div>
  );
  return (
    <Popover
      openClassName="dropdown-open"
      placement="bottom"
      trigger="click"
      content={overlay}
      key={Math.random()}
    >
      <div className="OrgDropdown">
        <p className="org-name">
          {selected ? selected : 'select an organization'}
        </p>
      </div>
    </Popover>
  );
};

export default OrgDropdown;
