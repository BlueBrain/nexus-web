import * as React from 'react';
import { Input } from 'antd';
import OrgCard, { OrgCardProps } from './OrgCard';

import './Orgs.less';

export interface OrgListProps {
  orgs: OrgCardProps[];
  onOrgClick?(label: string): void;
  onOrgEdit?(label: string): void;
}

const Search = Input.Search;

const OrgList: React.FunctionComponent<OrgListProps> = ({
  orgs,
  onOrgClick = () => {},
  onOrgEdit = () => {},
}) => {
  const [items, setItems] = React.useState(orgs);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const filtered = orgs.filter(org =>
      org.label.toLocaleLowerCase().includes(e.target.value.toLocaleLowerCase())
    );
    setItems(filtered);
  };

  return (
    <div className="OrgList">
      <Search
        className="filter"
        placeholder="Filter by name"
        onChange={handleChange}
      />
      <p className="result">
        Found {items.length} organization{items.length > 1 && 's'}
      </p>
      <div className="orgs">
        {items.map((org: OrgCardProps, i) => (
          // TODO org cards should be anchor tags with hrefs for SSR
          <OrgCard
            key={org.label + i}
            {...org}
            onClick={() => onOrgClick(org.label)}
            onEdit={() => onOrgEdit(org.label)}
          />
        ))}
      </div>
    </div>
  );
};

export default OrgList;
