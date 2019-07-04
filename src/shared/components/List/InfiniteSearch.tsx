import * as React from 'react';
import { Input, Spin } from 'antd';
import * as InfiniteScroll from 'react-infinite-scroller';

export type InfiniteSearchProps = {
  onLoadMore({ searchValue }: { searchValue: string }): void;
  hasMore: boolean;
  defaultSearchValue?: string;
  height?: number;
};
const InfiniteSearch: React.FunctionComponent<InfiniteSearchProps> = props => {
  const { onLoadMore, hasMore, defaultSearchValue } = props;
  const [searchValue, setSearchValue] = React.useState<string>(
    defaultSearchValue || ''
  );

  return (
    <div
      className="org-list"
      style={{ height: props.height, overflow: 'auto' }}
    >
      <Input.Search
        placeholder={'Find an Org by name...'}
        allowClear={true}
        value={searchValue}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          setSearchValue(e.currentTarget.value);
          onLoadMore({ searchValue: e.currentTarget.value });
        }}
      />
      <InfiniteScroll
        pageStart={0}
        loadMore={() => onLoadMore({ searchValue })}
        hasMore={hasMore}
        loader={<Spin spinning={true}>Loading</Spin>}
        useWindow={!props.height}
      >
        {props.children}
      </InfiniteScroll>
    </div>
  );
};

export default InfiniteSearch;
