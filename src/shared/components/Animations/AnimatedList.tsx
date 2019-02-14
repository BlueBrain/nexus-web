import * as React from 'react';
import { Spin, Pagination, Empty, Divider } from 'antd';
import './AnimatedList.less';
import { useTransition, animated } from 'react-spring';

const DEFAULT_TRAIL_MS = 50;

const DEFAULT_ANIMATIONS = {
  from: { transform: 'scale3d(0.8, 0.8, 0.8)', height: 0, opacity: 0 },
  leave: { transform: 'scale3d(0.8, 0.8, 0.8)', height: 0, opacity: 0 },
  enter: { transform: 'scale3d(1, 1, 1)', height: 'auto', opacity: 1 },
  trail: DEFAULT_TRAIL_MS,
};

export interface AnimatedListProps<Item> {
  header?: React.ReactNode;
  itemComponent: (item: Item, index: number) => React.ReactNode;
  itemName?: string;
  itemClassName?: string;
  results: Item[];
  total: number;
  makeKey?: (item: Item) => string;
  onPaginationChange?: (page: number, pageSize?: number) => void;
  paginationSettings?: { from: number; total: number; pageSize: number };
  loading?: boolean;
}

const AnimatedList: React.FunctionComponent<AnimatedListProps<any>> = props => {
  const {
    makeKey = (item: any) => item.id,
    itemComponent,
    itemClassName,
    header = <div />,
    loading = false,
    itemName = 'Item',
    total,
    results,
    paginationSettings,
    onPaginationChange,
  } = props;

  let PaginationSection = null;
  if (paginationSettings) {
    const { from, total, pageSize } = paginationSettings;
    const totalPages = Math.ceil(total / pageSize);
    const currentPage = Math.round(from / pageSize) + 1;
    PaginationSection = totalPages > 1 && (
      <Pagination
        total={total}
        onChange={onPaginationChange}
        pageSize={pageSize}
        current={currentPage}
      />
    );
  }
  const transitions = useTransition(results, makeKey, DEFAULT_ANIMATIONS);
  return (
    <div className="list-container">
      <div className="header">
        {header}
        {!!total && (
          <p className="result">{`Found ${total} ${itemName}${
            total > 1 ? 's' : ''
          }`}</p>
        )}
        <Divider />
      </div>
      <div className="list">
        <Spin spinning={loading}>
          {!!total &&
            transitions.map(({ item, key, props }, index: number) => (
              <animated.div className={itemClassName} style={props} key={key}>
                {itemComponent(item, index)}
              </animated.div>
            ))}
          {!total && <Empty />}
          {PaginationSection}
        </Spin>
      </div>
    </div>
  );
};

export default AnimatedList;
