import { useNexusContext } from '@bbp/react-nexus';
import { take } from 'lodash';
import * as React from 'react';
import { useQuery } from 'react-query';
import { useHistory, useLocation } from 'react-router';

import SearchBar from '../components/SearchBar';
import useQueryString from '../hooks/useQueryString';
import { makeSearchUri } from '../utils';
import { sortObjectsBySimilarity } from '../utils/stringSimilarity';

const STUDIO_RESULTS_DEFAULT_SIZE = 1000;
const PROJECT_RESULTS_DEFAULT_SIZE = 1000;
const SHOULD_INCLUDE_DEPRECATED = false;
const STORAGE_ITEM = 'last_search';
const SHOW_PROJECTS_NUMBER = 5;
const SHOW_STUDIOS_NUMBER = 3;

type SearchHit = {
  organisation: string;
  project: string;
  label: string;
  searchString: string;
  type: 'studio' | 'project';
};

export type ProjectSearchHit = SearchHit & {
  type: 'project';
};

export type StudioSearchHit = SearchHit & {
  type: 'studio';
  studioId: string;
};

export type LastVisited = {
  value: string;
  path: string;
  type: 'studio' | 'project' | 'search';
};

const SearchBarContainer: React.FC = () => {
  const nexus = useNexusContext();
  const history = useHistory();
  const [query, setQuery] = React.useState<string>();
  const [lastVisited, setLastVisited] = React.useState<LastVisited>();
  const location = useLocation();
  const [queryParams] = useQueryString();
  const { query: searchQueryParam } = queryParams;

  React.useEffect(() => {
    setQuery(searchQueryParam);
    if (searchQueryParam) {
      const searchLastVisit = {
        value: searchQueryParam as string,
        type: 'search' as 'studio' | 'project' | 'search',
        path: makeSearchUri(searchQueryParam),
      };
      setLastVisited(searchLastVisit);
    }
  }, [searchQueryParam]);

  React.useEffect(() => {
    if (lastVisited) {
      localStorage.setItem(STORAGE_ITEM, JSON.stringify(lastVisited));
    } else {
      localStorage.removeItem(STORAGE_ITEM);
    }
  }, [lastVisited]);

  const { data: projects } = useQuery(
    'projects',
    async () =>
      await nexus.Project.list(undefined, {
        size: PROJECT_RESULTS_DEFAULT_SIZE,
        deprecated: SHOULD_INCLUDE_DEPRECATED,
      })
  );

  const { data: studios } = useQuery(
    'studios',
    async () =>
      await nexus.Resource.list(undefined, undefined, {
        size: STUDIO_RESULTS_DEFAULT_SIZE,
        deprecated: SHOULD_INCLUDE_DEPRECATED,
        type: 'https://bluebrainnexus.io/studio/vocabulary/Studio',
      })
  );

  const handleSearch = (searchText: string) => {
    setQuery(searchText);
  };

  const handleSubmit = (value: string, option: any) => {
    if (option.type === 'search') {
      setQuery(value === '' ? option.value : value);
    }

    if (option.type === 'search') {
      history.push(makeSearchUri(value));
    } else if (option.type === 'project') {
      history.push(option.path);
    } else if (option.type === 'studio') {
      history.push(option.path);
    }
    return;
  };

  const handleClear = () => {
    // reset search
    history.push('/search');
    return;
  };

  const isCurrentPageSearchPage = () =>
    location.pathname.substring(0, 7) === '/search';
  const isQueryParamMatchingQuery = () => query === searchQueryParam;

  const handleBlur = () => {
    if (isCurrentPageSearchPage() && !isQueryParamMatchingQuery()) {
      setQuery(searchQueryParam);
    }
  };

  const inputOnPressEnter = () => {
    if (lastVisited) {
      handleSubmit(lastVisited.value, {
        type: lastVisited.type,
        path: lastVisited.path,
      });
    }
    return;
  };

  const matchedProjects = () => {
    const labeledProjects = projects?._results.map(project => ({
      organisation: project._organizationLabel,
      project: project._label,
      label: project._label as string,
      searchString: `${project._organizationLabel}${project._label}`,
      type: 'project' as const,
    }));

    if (query && labeledProjects && labeledProjects.length > 0) {
      const results = take(
        sortObjectsBySimilarity(query, 'label', labeledProjects),
        SHOW_PROJECTS_NUMBER
      );

      return results;
    }

    return [];
  };

  const orgAndProjectFromPath = (path: string) => {
    const [org, project] = path
      .substring(path.indexOf('/projects/') + 10)
      .split('/');
    return { project, organisation: org };
  };

  const matchedStudios: () => StudioSearchHit[] = () => {
    const labeledStudios = studios?._results.map(studio => ({
      ...orgAndProjectFromPath(studio._project),
      label: studio.label as string,
      searchString: `${studio.label}`,
      studioId: studio['@id'],
      type: 'studio' as const,
    }));

    if (query && labeledStudios && labeledStudios.length > 0) {
      return take(
        sortObjectsBySimilarity(query, 'label', labeledStudios),
        SHOW_STUDIOS_NUMBER
      );
    }

    return [];
  };

  return (
    <SearchBar
      projectList={matchedProjects()}
      studioList={matchedStudios()}
      query={query}
      lastVisited={lastVisited}
      onSearch={handleSearch}
      onSubmit={handleSubmit}
      onClear={handleClear}
      onFocus={() => {}}
      onBlur={handleBlur}
      inputOnPressEnter={inputOnPressEnter}
    />
  );
};

export default SearchBarContainer;
