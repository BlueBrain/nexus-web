import * as React from 'react';
import { Empty } from 'antd';
import './infinite-scroll.less';
import './list-item.less';
import { useTransition, animated, useSpring } from 'react-spring';
import { PaginatedList } from '@bbp/nexus-sdk';
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
  const [totalItems, setTotalItems] = React.useState<number>(0);
  const [totalItemsList, setTotalItemsList] = React.useState<any[]>([]);
  React.useEffect(() => {
    if (data) {
      setTotalItemsList([...totalItemsList, ...data.results]);
      setTotalItems(data.total);
    }
  }, [data && data.index]);
  const stillMoreToLoad = totalItemsList.length < totalItems;
  const animatedOpacityOnStillMoreToLoad = useSpring({
    opacity: stillMoreToLoad ? 1 : 0,
    delay: DEFAULT_TRAIL_MS * totalItemsList.length,
  });
  const keys = totalItemsList.map(makeKey);
  const transitions = useTransition(totalItemsList, keys, {
    ...DEFAULT_ANIMATIONS,
    unique: true,
  });
  return (
    <div className="infinite-scroll">
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
          {stillMoreToLoad && (
            <animated.div style={animatedOpacityOnStillMoreToLoad}>
              <a onClick={next}>
                <li className="list-item -action -load">Load More</li>
              </a>
            </animated.div>
          )}
        </ul>
      )}
    </div>
  );
};

export default InfiniteScroll;
