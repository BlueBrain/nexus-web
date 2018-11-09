import * as React from 'react';
import { Input } from 'antd';
import OrgCard, { OrgCardProps } from './OrgCard';

import './Orgs.less';

export interface OrgListProps {
  orgs: OrgCardProps[];
}

const OrgList: React.SFC<OrgListProps> = ({ orgs }) => {
  const [items, setItems] = React.useState(orgs);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const filtered = orgs.filter(org =>
      org.name.toLocaleLowerCase().includes(e.target.value.toLocaleLowerCase())
    );
    setItems(filtered);
  };

  return (
    <div className="OrgList">
      <Input
        className="filter"
        placeholder="Filter by name"
        onChange={handleChange}
      />
      <p className="result">
        Found {items.length} organization{items.length > 1 && 's'}
      </p>
      <div className="orgs">
        {items.map((org, i) => (
          <OrgCard key={org.name + i} {...org} />
        ))}
      </div>
    </div>
  );
};

export default OrgList;
