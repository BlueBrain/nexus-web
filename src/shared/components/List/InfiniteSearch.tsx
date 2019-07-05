import * as React from 'react';
import { Input, Spin } from 'antd';
import * as InfiniteScroll from 'react-infinite-scroller';

import './InfiniteSearch.less';

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
    <div className="infinite-search">
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
      <div
        className="scroll"
        style={{
          height: props.height,
          overflowY: props.height ? 'scroll' : 'initial',
        }}
      >
        <InfiniteScroll
          element="ul"
          pageStart={0}
          loadMore={() => onLoadMore({ searchValue })}
          hasMore={hasMore}
          loader={<Spin spinning={true}>Loading</Spin>}
          useWindow={!props.height}
        >
          {props.children}
        </InfiniteScroll>
      </div>
    </div>
  );
};

export default InfiniteSearch;
