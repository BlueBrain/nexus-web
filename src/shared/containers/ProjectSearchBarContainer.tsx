import { useNexusContext } from '@bbp/react-nexus';
import { take } from 'lodash';
import * as React from 'react';
import { useHistory } from 'react-router';
import { useQuery } from 'react-query';

import ProjectSearchBar from '../components/ProjectSearchBar';

const PROJECT_RESULTS_DEFAULT_SIZE = 300;
const SHOULD_INCLUDE_DEPRECATED = false;
const STORAGE_ITEM = 'last_visited_project';

const SearchBarContainer: React.FC = () => {
  const nexus = useNexusContext();
  const history = useHistory();
  const [query, setQuery] = React.useState<string>();
  const [lastVisited, setLastVisited] = React.useState<string>();

  const { isLoading, error, data } = useQuery(
    'projects',
    async () =>
      await nexus.Project.list(undefined, {
        size: PROJECT_RESULTS_DEFAULT_SIZE,
        deprecated: SHOULD_INCLUDE_DEPRECATED,
      })
  );

  const onFocus = () => {
    const lastVisited = localStorage.getItem(STORAGE_ITEM) || '';

    setLastVisited(lastVisited);
    setQuery(lastVisited);
  };

  const goToProject = (orgLabel: string, projectLabel: string) => {
    const path = `/admin/${orgLabel}/${projectLabel}`;

    history.push(path);
  };

  const handleSearch = (searchText: string) => {
    setLastVisited(undefined);
    setQuery(searchText);
  };

  const handleSubmit = (value: string) => {
    const orgAndProject = value;
    localStorage.setItem(STORAGE_ITEM, value);
    const [orgLabel, projectLabel] = orgAndProject.split('/');

    return goToProject(orgLabel, projectLabel);
  };

  const handleClear = () => {
    setQuery(undefined);
    setLastVisited(undefined);
    localStorage.removeItem(STORAGE_ITEM);
  };

  const inputOnPressEnter = () => {
    if (lastVisited) {
      handleSubmit(lastVisited);
    }
  };

  const projectList = take(
    (data?._results || []).filter((project: any) => {
      if (query) {
        return (
          project._label.toLowerCase().includes(query?.toLowerCase()) ||
          project._organizationLabel
            .toLowerCase()
            .includes(query?.toLowerCase())
        );
      }
      return false;
    }),
    PROJECT_RESULTS_DEFAULT_SIZE
  );

  return (
    <ProjectSearchBar
      projectList={projectList}
      query={query}
      onSearch={handleSearch}
      onSubmit={handleSubmit}
      onClear={handleClear}
      onFocus={onFocus}
      onBlur={() => setQuery('')}
      inputOnPressEnter={inputOnPressEnter}
    />
  );
};

export default SearchBarContainer;
