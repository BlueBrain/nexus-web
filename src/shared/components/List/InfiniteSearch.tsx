import './InfiniteSearch.scss';

import { Input } from 'antd';
import * as React from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';

const { Search } = Input;

export type InfiniteSearchProps = {
  onLoadMore({ searchValue }: { searchValue?: string }): void;
  hasMore: boolean;
  defaultSearchValue?: string;
  hasSearch?: boolean;
  height?: number;
  dataLength: number;
  scrollParent?: HTMLElement | string | null;
};
const InfiniteSearch: React.FunctionComponent<InfiniteSearchProps> = props => {
  const {
    onLoadMore,
    hasMore,
    defaultSearchValue,
    hasSearch = true,
    dataLength = 0, // what number are we at right now?
  } = props;
  const [searchValue, setSearchValue] = React.useState<string | undefined>(
    defaultSearchValue
  );

  React.useEffect(() => {
    setSearchValue(defaultSearchValue);
    if (inputRef.current) {
      // @ts-ignore
      inputRef.current.focus({
        cursor: 'end',
      });
    }
  }, [defaultSearchValue]);

  const inputRef = React.useRef(null);

  return (
    <div className="infinite-search" data-testid="infinite-search">
      {hasSearch && (
        <div className="search">
          <Search
            ref={inputRef}
            placeholder={'Search...'}
            allowClear={true}
            value={searchValue}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setSearchValue(e.currentTarget.value);
              onLoadMore({ searchValue: e.currentTarget.value });
            }}
          />
        </div>
      )}
      <InfiniteScroll
        className="infinite-scroller"
        dataLength={dataLength}
        next={() => onLoadMore({ searchValue })}
        hasMore={hasMore}
        loader={<h4>Loading...</h4>}
        height={props.height}
        scrollThreshold={'100px'}
        scrollableTarget={props.scrollParent}
      >
        {props.children}
      </InfiniteScroll>
    </div>
  );
};

export default InfiniteSearch;
