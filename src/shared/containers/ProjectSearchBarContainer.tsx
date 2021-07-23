import { useNexusContext } from '@bbp/react-nexus';
import { take } from 'lodash';
import * as React from 'react';
import { useHistory } from 'react-router';

import ProjectSearchBar from '../components/ProjectSearchBar';
import useAsyncCall from '../hooks/useAsynCall';

const PROJECT_RESULTS_DEFAULT_SIZE = 100;
const SHOULD_INCLUDE_DEPRECATED = false;

const SearchBarContainer: React.FC = () => {
  const nexus = useNexusContext();
  const history = useHistory();
  const [query, setQuery] = React.useState<string>();
  const [defaultQuery, setDefaultQuery] = React.useState<string | undefined>();

  const projectData = useAsyncCall(
    nexus.Project.list(undefined, {
      size: 100,
      deprecated: SHOULD_INCLUDE_DEPRECATED,
    }),
    []
  );

  React.useEffect(() => {
    const lastVisited = localStorage.getItem('last_visited_project') || '';

    setDefaultQuery(lastVisited);

    console.log('lastVisited', lastVisited);
  }, []);

  const goToProject = (orgLabel: string, projectLabel: string) => {
    const path = `/admin/${orgLabel}/${projectLabel}`;
    history.push(path);
  };

  const handleSearch = (searchText: string) => {
    setQuery(searchText);
  };

  const handleSubmit = (value: string) => {
    const orgAndProject = value;
    console.log('submitted', orgAndProject);
    // save selection
    localStorage.setItem('last_visited_project', orgAndProject);
    setDefaultQuery(orgAndProject);

    const [orgLabel, projectLabel] = orgAndProject.split('/');
    handleSearch('');

    return goToProject(orgLabel, projectLabel);
  };

  const handleClear = () => {
    setQuery(undefined);
  };

  const projectList = take(
    (projectData.data?._results || []).filter(project => {
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
      defaultQuery={defaultQuery}
      projectList={projectList}
      query={query}
      onSearch={handleSearch}
      onSubmit={handleSubmit}
      onClear={handleClear}
    />
  );
};

export default SearchBarContainer;
