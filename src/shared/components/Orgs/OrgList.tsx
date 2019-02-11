import * as React from 'react';
import { Input, Pagination } from 'antd';
import OrgCard, { OrgCardProps } from './OrgCard';

import './Orgs.less';
import AnimatedList from '../Animations/AnimatedList';

export interface OrgListProps {
  orgs: OrgCardProps[];
  busy?: boolean;
  onOrgClick?(label: string): void;
  onOrgEdit?(label: string): void;
  paginationSettings?: { total: number; from: number; pageSize: number };
  onPaginationChange?: (page: number, pageSize?: number) => void;
}

const Search = Input.Search;

const OrgList: React.FunctionComponent<OrgListProps> = ({
  orgs,
  busy = false,
  onOrgClick = () => {},
  onOrgEdit = () => {},
  paginationSettings,
  onPaginationChange,
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
          <OrgCard
            key={org.label + i}
            {...org}
            onClick={() => onOrgClick(org.label)}
            onEdit={() => onOrgEdit(org.label)}
          />
        )}
        onPaginationChange={onPaginationChange}
        makeKey={item => item.label}
        itemName="Organization"
        loading={busy}
        results={items}
        total={(paginationSettings && paginationSettings.total) || items.length}
        paginationSettings={
          paginationSettings && {
            from: paginationSettings.from,
            total: paginationSettings.total,
            pageSize: paginationSettings.pageSize,
          }
        }
      />
    </div>
  );
};

export default OrgList;
