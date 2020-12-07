import * as React from 'react';
import { useHistory, useLocation } from 'react-router';
import SearchBar, { SearchQuickActions } from '../components/SearchBar';
import useSearchConfigs from '../hooks/useSearchConfigs';
import useSearchQuery from '../hooks/useSearchQuery';
import { parseURL } from '../utils/nexusParse';

const DEFAULT_SEARCH_BAR_RESULT_SIZE = 10;

const SearchBarContainer: React.FC = () => {
  const { preferedSearchConfig, searchConfigs } = useSearchConfigs();

  const [searchResponse, { searchProps, setSearchProps }] = useSearchQuery(
    preferedSearchConfig?.view
  );
  const history = useHistory();
  const location = useLocation();

  const goToResource = (resourceSelfURL: string) => {
    const { org, project, id } = parseURL(resourceSelfURL);
    const path = `/${org}/${project}/resources/${encodeURIComponent(id)}`;
    history.push(path, {
      background: location,
    });
  };

  const goToSearch = () => {
    history.push(`/search?query=${searchProps.query}`);
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
      console.log({ action, resourceSelfURL });
      return goToResource(resourceSelfURL);
    }
    return goToSearch();
  };

  return !!searchConfigs.data?.length ? (
    <SearchBar
      query={searchProps.query}
      searchResponse={searchResponse}
      onSearch={handleSearch}
      onSubmit={handleSubmit}
      searchConfigLoading={searchConfigs.isFetching}
      searchConfigPreference={preferedSearchConfig}
    />
  ) : null;
};

export default SearchBarContainer;
