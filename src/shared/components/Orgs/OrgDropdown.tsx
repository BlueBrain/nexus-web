import * as React from 'react';
import { Button, Popover } from 'antd';
import { OrgCardProps } from './OrgCard';
import OrgList from './OrgList';

export interface OrgDropDownProps {
  activeName?: string;
  orgs?: OrgCardProps[];
}

const OrgDropdown: React.SFC<OrgDropDownProps> = ({
  activeName,
  orgs = [],
}) => {
  const [selected, setSelected] = React.useState(activeName);

  const overlay = (
    <div className="OrgDropdownPopover">
      <OrgList orgs={orgs} onOrgClick={name => setSelected(name)} />
      <div className="org-menu">
        <Button type="primary">Create New</Button>
        <Button>Explore All</Button>
      </div>
    </div>
  );
  return (
    <Popover placement="bottomLeft" trigger="click" content={overlay}>
      <div className="OrgDropdown">
        <p className="org-name">
          {selected ? selected : 'select an organization'}
        </p>
      </div>
    </Popover>
  );
};

export default OrgDropdown;
