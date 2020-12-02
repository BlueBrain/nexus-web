import * as React from 'react';
import SearchBar from '../components/SearchBar';
import useSearchConfigs from '../hooks/useSearchConfigs';
import useSearchQuery from '../hooks/useSearchQuery';

const DEFAULT_SEARCH_BAR_RESULT_SIZE = 20;

const SearchBarContainer: React.FC = () => {
  const { preferedSearchConfig, searchConfigs } = useSearchConfigs();

  const [searchResponse, { searchProps, setSearchProps }] = useSearchQuery(
    preferedSearchConfig?.view
  );

  const handleChange = (value: string) => {
    setSearchProps({
      query: value,
      pagination: {
        from: 0,
        size: DEFAULT_SEARCH_BAR_RESULT_SIZE,
      },
    });
  };

  const handleSubmit = (value: string) => {};

  return (
    <SearchBar
      query={searchProps.query}
      searchResponse={searchResponse}
      onChange={handleChange}
      onSearch={handleSubmit}
      searchConfigLoading={searchConfigs.isFetching}
      searchConfigPreference={preferedSearchConfig}
    />
  );
};

export default SearchBarContainer;
