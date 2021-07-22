import { useNexusContext } from '@bbp/react-nexus';
import { take } from 'lodash';
import * as React from 'react';
import { useHistory, useLocation } from 'react-router';
import SearchBar, { SearchQuickActions } from '../components/SearchBar';
import useAsyncCall from '../hooks/useAsynCall';
import useQueryString from '../hooks/useQueryString';
import useSearchConfigs from '../hooks/useSearchConfigs';
import useSearchQuery, { DEFAULT_SEARCH_PROPS } from '../hooks/useSearchQuery';
import { parseURL } from '../utils/nexusParse';

const DEFAULT_SEARCH_BAR_RESULT_SIZE = 50;
const PROJECT_RESULTS_DEFAULT_SIZE = 100;
const SHOULD_INCLUDE_DEPRECATED = false;

const SearchBarContainer: React.FC = () => {
  const { preferedSearchConfig, searchConfigs } = useSearchConfigs();

  const [searchResponse, { searchProps, setSearchProps }] = useSearchQuery({
    selfURL: preferedSearchConfig?.view,
  });
  const nexus = useNexusContext();
  const history = useHistory();
  const location = useLocation();
  const [queryParams, setQueryString] = useQueryString();
  const projectData = useAsyncCall(
    nexus.Project.list(undefined, {
      size: 100,
      deprecated: SHOULD_INCLUDE_DEPRECATED,
    }),
    []
  );

  const goToResource = (resourceSelfURL: string) => {
    const { org, project, id } = parseURL(resourceSelfURL);
    const path = `/${org}/${project}/resources/${encodeURIComponent(id)}`;
    history.push(path, {
      background: location,
    });
  };

  const goToProject = (orgLabel: string, projectLabel: string) => {
    const path = `/admin/${orgLabel}/${projectLabel}`;
    history.push(path);
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
    const [action, orgAndProject] = value.split(
      `${SearchQuickActions.VISIT_PROJECT}:`
    );
    const [orgLabel, projectLabel] = orgAndProject.split('/');
    handleSearch('');

    return goToProject(orgLabel, projectLabel);
  };

  const handleClear = () => {
    setSearchProps({
      ...searchProps,
      query: undefined,
    });
  };

  const projectList = take(
    (projectData.data?._results || []).filter(project => {
      if (searchProps.query) {
        return (
          project._label
            .toLowerCase()
            .includes(searchProps.query?.toLowerCase()) ||
          project._organizationLabel
            .toLowerCase()
            .includes(searchProps.query?.toLowerCase())
        );
      }
      return false;
    }),
    PROJECT_RESULTS_DEFAULT_SIZE
  );

  return (
    <SearchBar
      projectList={projectList}
      query={searchProps.query}
      onSearch={handleSearch}
      onSubmit={handleSubmit}
      onClear={handleClear}
    />
  );
};

export default SearchBarContainer;
