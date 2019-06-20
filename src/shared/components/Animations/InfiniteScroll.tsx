import * as React from 'react';
import { Empty } from 'antd';
import './infinite-scroll.less';
import './list-item.less';
import { PaginatedList } from '@bbp/nexus-sdk-legacy';
import { FetchableState } from '../../store/reducers/utils';
import useInfiniteScroll from '../hooks/useInfiniteScroll';

const LOAD_AT_PERCENTAGE_REVEALED = 0.8;

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
  const resultsComparator =
    data && JSON.stringify({ index: data.index, results: data.results });

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
  }, [resultsComparator]);

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
            <a onClick={loadNextPage}>
              <li className="list-item -action -load">
                <div className="loading">
                  <div className="center">
                    {isFetching ? 'Loading' : 'Load more'}
                  </div>
                </div>
              </li>
            </a>
          )}
        </ul>
      )}
    </div>
  );
};

export default InfiniteScroll;
