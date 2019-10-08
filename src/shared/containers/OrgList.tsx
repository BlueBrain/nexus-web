import * as React from 'react';
import { NexusClient } from '@bbp/nexus-sdk';
import { useNexusContext } from '@bbp/react-nexus';
import InfiniteSearch from '../components/List/InfiniteSearch';

const DEFAULT_PAGE_SIZE = 20;

const OrgListContainer: React.FunctionComponent<{
  children: any;
  defaultSearchValue?: string;
  height?: number;
}> = props => {
  const nexus: NexusClient = useNexusContext();
  const [orgs, setOrgs] = React.useState<any>({
    total: 0,
    items: [],
    searchValue: props.defaultSearchValue,
    includeDeprecated: false,
  });

  // initial load
  React.useEffect(() => {
    nexus.Organization.list({
      size: DEFAULT_PAGE_SIZE,
      label: orgs.searchValue,
      deprecated: orgs.includeDeprecated,
    }).then(res =>
      setOrgs({ ...orgs, total: res._total, items: res._results })
    );
  }, []);

  const loadMore = ({ searchValue }: { searchValue: string }) => {
    // if filters have changed, we need to reset:
    // - the entire list back to []
    // - the from index back to 0
    const newFilter: boolean = searchValue !== orgs.searchValue;
    nexus.Organization.list({
      size: DEFAULT_PAGE_SIZE,
      from: newFilter ? 0 : orgs.items.length,
      label: searchValue,
      deprecated: orgs.includeDeprecated,
    }).then(res => {
      setOrgs({
        searchValue,
        total: res._total,
        items: newFilter ? res._results : [...orgs.items, ...res._results],
      });
    });
  };
  return (
    <InfiniteSearch
      onLoadMore={loadMore}
      hasMore={orgs.items.length < orgs.total}
      defaultSearchValue={props.defaultSearchValue}
      height={props.height}
    >
      {props.children && props.children({ items: orgs.items })}
    </InfiniteSearch>
  );
};

export default OrgListContainer;
