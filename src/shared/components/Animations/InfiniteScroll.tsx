import * as React from 'react';
import { Empty } from 'antd';
import './infinite-scroll.less';
import './list-item.less';
import { useTransition, animated, useSpring, config } from 'react-spring';
import { PaginatedList } from '@bbp/nexus-sdk';
import { FetchableState } from '../../store/reducers/utils';
import useInfiniteScroll from '../hooks/useInfiniteScroll';

const DEFAULT_TRAIL_MS = 50;

const DEFAULT_ANIMATIONS = {
  from: { transform: 'scale3d(0.8, 0.8, 0.8)', height: 0, opacity: 0 },
  leave: { transform: 'scale3d(0.8, 0.8, 0.8)', height: 0, opacity: 0 },
  enter: { transform: 'scale3d(1, 1, 1)', height: 'auto', opacity: 1 },
  trail: DEFAULT_TRAIL_MS,
};

export const InfiniteScrollLoadMoreButton: React.FunctionComponent<{
  hasMore: boolean;
  totalItemsListLength: number;
  onClick: VoidFunction;
  isFetching: boolean;
}> = ({ hasMore, totalItemsListLength, onClick, isFetching }) => {
  const animatedOpacity = useSpring({
    opacity: hasMore ? 1 : 0,
    // TODO why: This doesn't work as described https://www.react-spring.io/docs/hooks/api
    config: config.molasses,
    delay: DEFAULT_TRAIL_MS * totalItemsListLength,
  });
  const animatedLoadTransition = useTransition(isFetching, null, {
    from: { position: 'absolute', opacity: 0 },
    enter: { opacity: 1 },
    leave: { opacity: 0 },
  });
  return (
    <animated.div style={animatedOpacity}>
      <a onClick={onClick}>
        <li className="list-item -action -load">
          <div className="loading">
            {animatedLoadTransition.map(({ item, props }) =>
              item ? (
                <animated.div style={props} className="center-helper">
                  <div className="center">Loading</div>
                </animated.div>
              ) : (
                <animated.div style={props} className="center-helper">
                  <div className="center">Load More</div>
                </animated.div>
              )
            )}
          </div>
        </li>
      </a>
    </animated.div>
  );
};

export interface InfiniteScrollProps {
  itemComponent: (item: any, index: number) => React.ReactElement;
  itemClassName?: string;
  makeKey: (item: any, index: number) => string;
  next: VoidFunction;
  style?: React.CSSProperties;
  fetchablePaginatedList: FetchableState<PaginatedList<any>>;
  loadAtPercentRevealed?: number;
}

const LOAD_AT_PERCENTAGE_REVEALED = 0.8;

const InfiniteScroll: React.FunctionComponent<InfiniteScrollProps> = props => {
  const {
    makeKey,
    itemClassName,
    itemComponent,
    fetchablePaginatedList,
    next,
    style,
    loadAtPercentRevealed = LOAD_AT_PERCENTAGE_REVEALED,
  } = props;
  const { isFetching, data, error } = fetchablePaginatedList;
  const [totalItems, setTotalItems] = React.useState<number>(0);
  const [totalItemsList, setTotalItemsList] = React.useState<any[]>([]);
  const [bind] = useInfiniteScroll(next, isFetching, loadAtPercentRevealed);
  React.useEffect(() => {
    if (data) {
      setTotalItemsList([...totalItemsList, ...data.results]);
      setTotalItems(data.total);
    }
  }, [data && data.index]);
  const hasMore = totalItemsList.length < totalItems;
  const keys = totalItemsList.map(makeKey);
  const transitions = useTransition(totalItemsList, keys, {
    ...DEFAULT_ANIMATIONS,
    unique: true,
  });
  return (
    <div {...bind} className="infinite-scroll" style={style}>
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
          {hasMore && (
            <InfiniteScrollLoadMoreButton
              key="loading-action"
              isFetching={isFetching}
              hasMore={hasMore}
              totalItemsListLength={totalItemsList.length}
              onClick={next}
            />
          )}
          {!!totalItems && !isFetching && !hasMore && (
            <li className="list-item -action -end-of-list">
              You've reached the end of this list
            </li>
          )}
        </ul>
      )}
    </div>
  );
};

export default InfiniteScroll;
