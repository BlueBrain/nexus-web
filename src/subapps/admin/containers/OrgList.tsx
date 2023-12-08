import { OrgResponseCommon } from '@bbp/nexus-sdk/es';
import * as React from 'react';

import InfiniteSearch from '../../../shared/components/List/InfiniteSearch';

const OrgListContainer: React.FunctionComponent<{
  children: any;
  defaultSearchValue?: string;
  height?: number;
  orgs: {
    total: number;
    items: OrgResponseCommon[];
    searchValue?: string;
    includeDeprecated?: boolean;
  };
  loadMore: ({ searchValue }: { searchValue: string }) => void;
}> = props => {
  return (
    <InfiniteSearch
      dataLength={props.orgs.items.length}
      onLoadMore={props.loadMore}
      hasMore={props.orgs.items.length < props.orgs.total}
      defaultSearchValue={props.defaultSearchValue}
      height={props.height}
    >
      {props.children && props.children({ items: props.orgs.items })}
    </InfiniteSearch>
  );
};

export default OrgListContainer;
