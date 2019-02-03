import * as React from 'react';
import { Spin, Pagination, Empty, Divider } from 'antd';
import { PaginationSettings } from '@bbp/nexus-sdk';
import './AnimatedList.less';
import { Trail, config, animated } from 'react-spring';

export interface AnimatedListProps<T> {
  header?: React.ReactNode;
  itemComponent: (item: any, index: number) => React.ReactNode;
  itemName?: string;
  results: any[];
  total: number;
  onPaginationChange: () => void;
  paginationSettings: PaginationSettings;
  loading?: boolean;
}

const AnimatedList: React.FunctionComponent<AnimatedListProps<any>> = props => {
  const {
    itemComponent,
    header = <div />,
    loading = true,
    itemName = 'Item',
    total,
    results,
    paginationSettings,
    onPaginationChange,
  } = props;
  const { from, size } = paginationSettings;
  const totalPages = Math.ceil(total / size);
  const current = Math.ceil((totalPages / total) * (from || 1));
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
            <Trail
              items={results}
              keys={item => item.id}
              from={{ transform: 'scale3d(0.8,0.8,0.8)' }}
              config={config.gentle}
              to={{ transform: 'scale3d(1, 1, 1)' }}
              native={true}
            >
              {(item: any, index: number) => props => (
                <animated.div style={props}>
                  {itemComponent(item, index)}
                </animated.div>
              )}
            </Trail>
          )}
          {!total && <Empty />}
          {!!total && totalPages > 1 && (
            <Pagination
              total={total}
              current={current}
              onChange={onPaginationChange}
              pageSize={size}
            />
          )}
        </Spin>
      </div>
    </div>
  );
};

export default AnimatedList;
