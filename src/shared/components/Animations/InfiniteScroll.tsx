import * as React from 'react';
import { Spin, Pagination, Empty, Divider } from 'antd';
import './infinite-scroll.less';
import { useTransition, animated } from 'react-spring';

const DEFAULT_TRAIL_MS = 50;

const DEFAULT_ANIMATIONS = {
  from: { transform: 'scale3d(0.8, 0.8, 0.8)', height: 0, opacity: 0 },
  leave: { transform: 'scale3d(0.8, 0.8, 0.8)', height: 0, opacity: 0 },
  enter: { transform: 'scale3d(1, 1, 1)', height: 'auto', opacity: 1 },
  trail: DEFAULT_TRAIL_MS,
};

export interface InfiniteScrollProps {
  type?: 'onScroll' | 'onClick';
  itemComponent: (item: any, index: number) => React.ReactElement;
  items: any[];
  total: number;
  itemClassName?: string;
  makeKey: (item: any, index: number) => string;
  next: VoidFunction;
  loading?: boolean;
}

const InfiniteScroll: React.FunctionComponent<
  // TODO: Figure out how to typescript
  InfiniteScrollProps
> = props => {
  const {
    makeKey,
    itemClassName,
    itemComponent,
    loading = false,
    total,
    items,
    next,
    type = 'onClick',
  } = props;

  const stillMoreToLoad = items.length < total;
  const keys = items.map(makeKey);
  const transitions = useTransition(items, keys, {
    ...DEFAULT_ANIMATIONS,
    unique: true,
  });
  return (
    <div className="infinite-scroll">
      <Spin spinning={loading}>
        <div className="body">
          <ul className="list">
            {!!total &&
              transitions.map(({ item, props }, index: number) => {
                return (
                  <animated.div
                    className={itemClassName}
                    style={props}
                    key={keys[index]}
                  >
                    {itemComponent(item, index)}
                  </animated.div>
                );
              })}
            {!total && <Empty />}
          </ul>
          <div className="actions">
            {stillMoreToLoad && <a onClick={next}>LoadMore</a>}
          </div>
        </div>
      </Spin>
    </div>
  );
};

export default InfiniteScroll;
