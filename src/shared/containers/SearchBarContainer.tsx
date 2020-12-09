import * as React from 'react';
import { useHistory, useLocation } from 'react-router';
import SearchBar, { SearchQuickActions } from '../components/SearchBar';
import useQueryString from '../hooks/useQueryString';
import useSearchConfigs from '../hooks/useSearchConfigs';
import useSearchQuery, { DEFAULT_SEARCH_PROPS } from '../hooks/useSearchQuery';
import { parseURL } from '../utils/nexusParse';

const DEFAULT_SEARCH_BAR_RESULT_SIZE = 10;

const SearchBarContainer: React.FC = () => {
  const { preferedSearchConfig, searchConfigs } = useSearchConfigs();

  const [searchResponse, { searchProps, setSearchProps }] = useSearchQuery(
    preferedSearchConfig?.view
  );
  const history = useHistory();
  const location = useLocation();
  const [queryParams, setQueryString] = useQueryString();

  const goToResource = (resourceSelfURL: string) => {
    const { org, project, id } = parseURL(resourceSelfURL);
    const path = `/${org}/${project}/resources/${encodeURIComponent(id)}`;
    history.push(path, {
      background: location,
    });
  };

  const goToSearch = () => {
    if (searchProps.query) {
      // reset pagination if we have a search query
      setQueryString(
        {
          ...queryParams,
          pagination: DEFAULT_SEARCH_PROPS.pagination,
          query: searchProps.query,
        },
        '/search'
      );
    }
  };

  const handleSearch = (searchText: string) => {
    setSearchProps({
      query: searchText,
      pagination: {
        from: 0,
        size: DEFAULT_SEARCH_BAR_RESULT_SIZE,
      },
    });
  };

  const handleSubmit = (value: string) => {
    if (value.includes(`${SearchQuickActions.VISIT}:`)) {
      const [action, resourceSelfURL] = value.split(
        `${SearchQuickActions.VISIT}:`
      );
      return goToResource(resourceSelfURL);
    }
    return goToSearch();
  };

  const handleClear = () => {
    setSearchProps({
      ...searchProps,
      query: undefined,
    });
  };

  return !!searchConfigs.data?.length ? (
    <SearchBar
      query={searchProps.query}
      searchResponse={searchResponse}
      onSearch={handleSearch}
      onSubmit={handleSubmit}
      onClear={handleClear}
      searchConfigLoading={searchConfigs.isFetching}
      searchConfigPreference={preferedSearchConfig}
    />
  ) : null;
};

export default SearchBarContainer;
