import * as React from 'react';
import { Spin, Pagination, Empty, Divider } from 'antd';
import './AnimatedList.less';
import { Transition, config, animated } from 'react-spring';

const DEFAULT_TRAIL_MS = 100;

const DEFAULT_ANIMATIONS = {
  from: { transform: 'scale3d(0.8, 0.8, 0.8)', height: 0, opacity: 0 },
  leave: { transform: 'scale3d(0.8, 0.8, 0.8)', height: 0, opacity: 0 },
  enter: { transform: 'scale3d(1, 1, 1)', height: 117, opacity: 1 },
};

export interface AnimatedListProps<Item> {
  header?: React.ReactNode;
  itemComponent: (item: Item, index: number, state: any) => React.ReactNode;
  itemName?: string;
  results: Item[];
  total: number;
  makeKey?: (item: Item) => string;
  onPaginationChange?: (page: number, pageSize?: number) => void;
  paginationSettings?: { from: number; total: number };
  loading?: boolean;
}

const AnimatedList: React.FunctionComponent<AnimatedListProps<any>> = props => {
  const {
    makeKey = (item: any) => item.id,
    itemComponent,
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
    const { from, total } = paginationSettings;
    const size = results.length;
    const totalPages = Math.ceil(total / size);
    PaginationSection = totalPages > 1 && (
      <Pagination
        total={total}
        current={from}
        onChange={onPaginationChange}
        pageSize={size}
      />
    );
  }

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
          {!!total && (
            <Transition
              trail={DEFAULT_TRAIL_MS}
              items={results}
              keys={makeKey}
              {...DEFAULT_ANIMATIONS}
              native={true}
            >
              {(item: any, state: any, index: number) => props => (
                <animated.div style={props}>
                  {itemComponent(item, index, state)}
                </animated.div>
              )}
            </Transition>
          )}
          {!total && <Empty />}
          {PaginationSection}
        </Spin>
      </div>
    </div>
  );
};

export default AnimatedList;
