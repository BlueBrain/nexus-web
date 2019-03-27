import * as React from 'react';
import { Spin, Pagination, Empty, Divider } from 'antd';
import './AnimatedInfiniteScrollList.less';
import { useTransition, animated } from 'react-spring';

const DEFAULT_TRAIL_MS = 50;

const DEFAULT_ANIMATIONS = {
  from: { transform: 'scale3d(0.8, 0.8, 0.8)', height: 0, opacity: 0 },
  leave: { transform: 'scale3d(0.8, 0.8, 0.8)', height: 0, opacity: 0 },
  enter: { transform: 'scale3d(1, 1, 1)', height: 'auto', opacity: 1 },
  trail: DEFAULT_TRAIL_MS,
};

export interface AnimatedInfiniteScrollProps<Item> {
  refreshValue?: string;
  itemComponent: (item: Item, index: number) => React.ReactNode;
  itemClassName?: string;
  results: Item[];
  total: number;
  makeKey?: (item: Item, index: number) => string;
  onPaginationChange?: (page: number, pageSize?: number) => void;
  paginationSettings?: { from: number; total: number; pageSize: number };
  loading?: boolean;
}

const AnimatedInfiniteScrollList: React.FunctionComponent<
  AnimatedInfiniteScrollProps<any>
> = React.memo(props => {
  const {
    refreshValue,
    makeKey = (item: any) => item.id,
    itemComponent,
    itemClassName,
    loading = false,
    total,
    results,
    paginationSettings,
    onPaginationChange,
  } = props;

  const [listData, setListData] = React.useState<any[]>([]);
  const [paginationLoading, setPaginationLoading] = React.useState(false);
  const resultsEqualChecker = results.map(result => result.id).join('');
  const reset = paginationSettings ? paginationSettings.from === 1 : true;

  React.useEffect(() => {
    setListData(listData.concat(results));
  }, [resultsEqualChecker]);

  React.useEffect(() => {
    setListData(results);
  }, [refreshValue]);

  React.useEffect(() => {
    if (paginationLoading) {
      setPaginationLoading(false);
    }
  }, [loading]);

  let PaginationSection = null;
  if (paginationSettings) {
    const { from, total, pageSize } = paginationSettings;
    const totalPages = Math.ceil(total / pageSize);
    const currentPage = Math.round(from / pageSize) + 1;
    const handlePaginationChange = () => {
      if (onPaginationChange) {
        setPaginationLoading(true);
        return onPaginationChange(currentPage + 1, pageSize);
      }
    };
    PaginationSection = totalPages > 1 && currentPage < totalPages && (
      <a onClick={handlePaginationChange}>
        {paginationLoading ? 'Loading' : 'Load more'}
      </a>
    );
  }

  // Some problem with useTransition's makeKey api :(
  const keys = listData.map(makeKey);
  // const transitions = useTransition(listData, keys, {
  //   ...DEFAULT_ANIMATIONS,
  //   reset,
  //   unique: true,
  // });
  return (
    <div className="list-container">
      <div className="list">
        <Spin spinning={loading && !reset}>
          {!!total &&
            listData.map((item, index: number) => {
              return (
                <div className={itemClassName} key={keys[index]}>
                  {itemComponent(item, index)}
                </div>
              );
            })}
          {!total && <Empty />}
          {PaginationSection}
        </Spin>
      </div>
    </div>
  );
});

export default AnimatedInfiniteScrollList;
