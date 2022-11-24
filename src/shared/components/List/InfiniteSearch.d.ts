import * as React from 'react';
import './InfiniteSearch.less';
export declare type InfiniteSearchProps = {
  onLoadMore({ searchValue }: { searchValue?: string }): void;
  hasMore: boolean;
  defaultSearchValue?: string;
  hasSearch?: boolean;
  height?: number;
  dataLength: number;
  scrollParent?: HTMLElement | string | null;
};
declare const InfiniteSearch: React.FunctionComponent<InfiniteSearchProps>;
export default InfiniteSearch;
