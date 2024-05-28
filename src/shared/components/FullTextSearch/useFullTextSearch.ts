import { useState } from 'react';
import { useNexusContext } from '@bbp/react-nexus';
import { useQuery } from 'react-query';
import { getOrgAndProjectFromProjectId } from 'shared/utils';
import { groupBy } from 'lodash';

export function useFullTextSearch() {
  const [search, setSearch] = useState('');
  const nexus = useNexusContext();

  const onSearch = (value: string) => setSearch(value);
  const resetSearch = () => setSearch('');

  const { isLoading, data } = useQuery({
    enabled: !!search,
    queryKey: ['cmdk-search', { search }],
    queryFn: () =>
      nexus.Resource.list(undefined, undefined, {
        q: search,
        deprecated: false,
      }),
    select: data => data._results,
    staleTime: 2,
  });

  const resources = groupBy(data, '_project');

  const searchResults = Object.entries(resources).map(([key, value]) => {
    const orgProject = getOrgAndProjectFromProjectId(key);
    return {
      id: key,
      title: orgProject,
      items: value,
    };
  });

  return {
    search,
    onSearch,
    resetSearch,
    isLoading,
    searchResults,
  };
}
