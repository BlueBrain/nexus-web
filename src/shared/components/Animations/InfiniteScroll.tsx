import * as React from 'react';
import { Empty } from 'antd';
import './infinite-scroll.less';
import './list-item.less';
import { PaginatedList } from '@bbp/nexus-sdk';
import { FetchableState } from '../../store/reducers/utils';
import useInfiniteScroll from '../hooks/useInfiniteScroll';

const DEFAULT_TRAIL_MS = 50;
const LOAD_AT_PERCENTAGE_REVEALED = 0.8;

export const InfiniteScrollLoadMoreButton: React.FunctionComponent<{
  hasMore: boolean;
  totalItemsListLength: number;
  onClick: VoidFunction;
  isFetching: boolean;
}> = ({ onClick, isFetching }) => {
  return (
    <a onClick={onClick}>
      <li className="list-item -action -load">
        <div className="loading">
          <div className="center">{isFetching ? 'Loading' : 'Load more'}</div>
        </div>
      </li>
    </a>
  );
};

export interface InfiniteScrollProps {
  itemComponent: (item: any, index: number) => React.ReactElement | null;
  loadNextPage: VoidFunction;
  style?: React.CSSProperties;
  fetchablePaginatedList: FetchableState<PaginatedList<any>>;
  loadAtPercentRevealed?: number;
}

const InfiniteScroll: React.FunctionComponent<InfiniteScrollProps> = props => {
  const {
    itemComponent,
    fetchablePaginatedList,
    loadNextPage,
    style,
    loadAtPercentRevealed = LOAD_AT_PERCENTAGE_REVEALED,
  } = props;
  const { isFetching, data, error } = fetchablePaginatedList;
  // concatenated list of all items
  const [itemsList, setItemsList] = React.useState<any[]>([]);

  const [bind] = useInfiniteScroll(
    loadNextPage,
    isFetching,
    loadAtPercentRevealed,
    itemsList.length,
    (data && data.total) || 0
  );

  // TODO: Is there a cheaper way to do comparing with Arrays of Objects?
  const resultsComparator = data && JSON.stringify(data.results);

  React.useEffect(() => {
    // Reset results if we're on the first paginated page
    if (data && data.index === 0) {
      setItemsList([...data.results]);
      return;
    }
    // otherwise let's concatenate them
    if (data) {
      setItemsList([...itemsList, ...data.results]);
      return;
    }
  }, [data && data.index, resultsComparator]);
  const hasMore = itemsList.length < ((data && data.total) || 0);
  return (
    <div {...bind} className="infinite-scroll" style={style}>
      {!!error && <Empty description={error.message} />}
      {!error && (
        <ul className="list">
          {itemsList.map((item: any, index: number) => {
            return itemComponent(item, index);
          })}
          {!isFetching && (!data || !data.total) && <Empty />}
          {hasMore && (
            <InfiniteScrollLoadMoreButton
              key="loading-action"
              isFetching={isFetching}
              hasMore={hasMore}
              totalItemsListLength={itemsList.length}
              onClick={loadNextPage}
            />
          )}
        </ul>
      )}
    </div>
  );
};

export default InfiniteScroll;
