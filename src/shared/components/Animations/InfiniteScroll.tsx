import * as React from 'react';
import { Spin, Pagination, Empty, Divider } from 'antd';
import './infinite-scroll.less';
import { useTransition, animated } from 'react-spring';
import { PaginationSettings, PaginatedList } from '@bbp/nexus-sdk';
import { FetchableState } from '../../store/reducers/utils';

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
  itemClassName?: string;
  makeKey: (item: any, index: number) => string;
  next: VoidFunction;
  fetchablePaginatedList: FetchableState<PaginatedList<any>>;
}

const InfiniteScroll: React.FunctionComponent<
  // TODO: Figure out how to typescript
  InfiniteScrollProps
> = props => {
  const {
    makeKey,
    itemClassName,
    itemComponent,
    fetchablePaginatedList,
    next,
    type = 'onClick',
  } = props;
  const { isFetching, data, error } = fetchablePaginatedList;
  const [totalItems, setTotalItems] = React.useState<any[]>([]);
  React.useEffect(() => {
    if (data) {
      setTotalItems([...totalItems, ...data.results]);
    }
  }, [data && data.index]);
  const stillMoreToLoad = !!data && totalItems.length < data.total;
  const keys = totalItems.map(makeKey);
  const transitions = useTransition(totalItems, keys, {
    ...DEFAULT_ANIMATIONS,
    unique: true,
  });
  return (
    <div className="infinite-scroll">
      <div className="body">
        {!!error && <Empty description={error.message} />}
        {!error && (
          <ul className="list">
            {transitions.map(({ item, props }, index: number) => {
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
            {!data || (!data.total && <Empty />)}
          </ul>
        )}
        <div className="actions">
          {stillMoreToLoad && <a onClick={next}>LoadMore</a>}
        </div>
      </div>
    </div>
  );
};

export default InfiniteScroll;
