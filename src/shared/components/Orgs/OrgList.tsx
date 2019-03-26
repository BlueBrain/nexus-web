import * as React from 'react';
import { Empty } from 'antd';
import OrgCard, { OrgCardProps } from './OrgCard';

import './Orgs.less';
import AnimatedInfiniteScrollList from '../Animations/AnimatedInfiniteScrollList';

export interface OrgListProps {
  orgs: OrgCardProps[];
  busy?: boolean;
  error?: { message: string; name: string };
  onOrgClick?(label: string): void;
  onOrgEdit?(label: string): void;
  paginationSettings?: { total: number; from: number; pageSize: number };
  onPaginationChange?: (page: number, pageSize?: number) => void;
}

const OrgList: React.FunctionComponent<OrgListProps> = ({
  orgs,
  busy = false,
  error = false,
  onOrgClick = () => {},
  onOrgEdit = () => {},
  paginationSettings,
  onPaginationChange,
}) => {
  if (error) {
    return (
      <Empty
        description={
          <span>An error happened while retrieving Organizations</span>
        }
      />
    );
  }
  return (
    <div className="OrgList">
      <AnimatedInfiniteScrollList
        itemComponent={(org, i) => (
          <OrgCard
            key={org.label + i}
            {...org}
            onClick={() => onOrgClick(org.label)}
            onEdit={() => onOrgEdit(org.label)}
          />
        )}
        onPaginationChange={onPaginationChange}
        makeKey={item => item.id}
        loading={busy}
        results={orgs}
        total={(paginationSettings && paginationSettings.total) || orgs.length}
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
