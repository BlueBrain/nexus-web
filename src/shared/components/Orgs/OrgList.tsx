import * as React from 'react';
import { Input } from 'antd';
import OrgCard, { OrgCardProps } from './OrgCard';

import './Orgs.less';
import AnimatedList from '../Animations/AnimatedList';

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
      <AnimatedList
        itemComponent={(org, i) => (
          // TODO org cards should be anchor tags with hrefs for SSR
          <OrgCard
            key={org.label + i}
            {...org}
            onClick={() => onOrgClick(org.label)}
            onEdit={() => onOrgEdit(org.label)}
          />
        )}
        makeKey={item => item.label}
        itemName="Organization"
        loading={!orgs}
        results={items}
        total={items.length}
      />
    </div>
  );
};

export default OrgList;
