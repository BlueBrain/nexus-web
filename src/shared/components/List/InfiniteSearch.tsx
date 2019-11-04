import * as React from 'react';
import { Input } from 'antd';
import * as InfiniteScroll from 'react-infinite-scroll-component';

import { uuidv4 } from '../../utils';

import './InfiniteSearch.less';

export type InfiniteSearchProps = {
  onLoadMore({ searchValue }: { searchValue?: string }): void;
  hasMore: boolean;
  defaultSearchValue?: string;
  hasSearch?: boolean;
  height?: number;
  dataLength: number;
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
  const scrollId = uuidv4();

  return (
    <div className="infinite-search">
      {hasSearch && (
        <Input.Search
          className="search"
          placeholder={'Search...'}
          allowClear={true}
          value={searchValue}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setSearchValue(e.currentTarget.value);
            onLoadMore({ searchValue: e.currentTarget.value });
          }}
        />
      )}
      <div
        className="scroll"
        id={scrollId}
        style={{
          height: props.height,
          overflowY: props.height ? 'scroll' : 'initial',
        }}
      >
        <InfiniteScroll
          dataLength={dataLength}
          next={() => onLoadMore({ searchValue })}
          hasMore={hasMore}
          loader={<h4>Loading...</h4>}
          scrollableTarget={!!props.height && scrollId}
        >
          {props.children}
        </InfiniteScroll>
      </div>
    </div>
  );
};

export default InfiniteSearch;
