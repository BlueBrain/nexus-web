import * as React from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { useNexusContext } from '@bbp/react-nexus';
import {
  DEFAULT_ELASTIC_SEARCH_VIEW_ID,
  ElasticSearchViewQueryResponse,
  Resource,
} from '@bbp/nexus-sdk/es';

import ResourceListComponent, {
  ResourceBoardList,
} from '../components/ResourceList';
import TypeDropdownFilterContainer from './TypeDropdownFilter';
import SchemaDropdownFilterContainer from './SchemaDropdownFilters';
import SchemaLinkContainer from './SchemaLink';

// Emojis cannot be base64 encoded without URI encoding
export const encodeShareableList = (list: ResourceBoardList) => {
  return btoa(encodeURIComponent(JSON.stringify(list)));
};
export const decodeShareableList = (base64string: string) => {
  return JSON.parse(decodeURIComponent(atob(base64string)));
};

const ResourceListContainer: React.FunctionComponent<{
  orgLabel: string;
  projectLabel: string;
  refreshList?: boolean;
  onDeleteList: (id: string) => void;
  onCloneList: (list: ResourceBoardList) => void;
  list: ResourceBoardList;
  setList: (list: ResourceBoardList) => void;
}> = ({
  orgLabel,
  projectLabel,
  onDeleteList,
  onCloneList,
  list,
  setList,
  refreshList,
}) => {
  const nexus = useNexusContext();
  const history = useHistory();
  const location = useLocation();
  const [toggleForceReload, setToggleForceReload] = React.useState(false);
  const [
    { busy, error, resources, total, next },
    setResources,
  ] = React.useState<{
    busy: boolean;
    error: Error | null;
    resources: Resource[];
    next: string | null;
    total: number;
  }>({
    next: null,
    busy: false,
    error: null,
    resources: [],
    total: 0,
  });

  const [paginationState, setPaginationState] = React.useState<{
    currentPage: number;
    pageSize?: number;
  }>({
    currentPage: 1,
  });

  const handlePaginationChange = (
    searchValue: string,
    page: number,
    pageSize: number
  ) => {
    setPaginationState({
      pageSize,
      currentPage: page,
    });

    const query = {
      ...list.query,
      q: searchValue,
      from: (page - 1) * pageSize,
      size: pageSize,
    };

    if (searchValue !== list.query.q) {
      return setList({
        ...list,
        query,
      });
    }

    if (busy) {
      return;
    }

    setList({
      ...list,
      query,
    });
  };

  const makeResourceUri = (resourceId: string) => {
    return `/${orgLabel}/${projectLabel}/resources/${encodeURIComponent(
      resourceId
    )}`;
  };

  const goToResource = (resourceId: string) => {
    history.push(makeResourceUri(resourceId), { background: location });
  };

  React.useEffect(() => {
    // Reset pagination on first load
    list.query.from = 0;
  }, []);

  React.useEffect(() => {
    setResources({
      next,
      resources,
      total,
      busy: true,
      error: null,
    });

    (async () => {
      const [resourcesByIdOrSelf, resourcesResults] = await Promise.allSettled([
        nexus.View.elasticSearchQuery(
          orgLabel,
          projectLabel,
          encodeURIComponent(DEFAULT_ELASTIC_SEARCH_VIEW_ID),
          {
            query: {
              bool: {
                should: [
                  {
                    bool: {
                      must: [
                        {
                          term: {
                            _deprecated: list.query.deprecated,
                          },
                        },
                        {
                          term: {
                            '@id': list.query.q,
                          },
                        },
                      ].filter(query => !isEmpty(query)),
                    },
                  },
                  {
                    bool: {
                      must: [
                        {
                          term: {
                            _deprecated: list.query.deprecated,
                          },
                        },
                        {
                          term: {
                            _self: list.query.q,
                          },
                        },
                      ].filter(query => !isEmpty(query)),
                    },
                  },
                ],
              },
            },
            size: 10,
          }
        ),
        nexus.Resource.list(
          orgLabel,
          projectLabel,
          list.query.q ? { ...list.query, sort: undefined } : list.query
        ),
      ]);

      if (resourcesByIdOrSelf.status === 'fulfilled') {
        const resultsLength = resourcesByIdOrSelf.value.hits.hits.length;
        const hits = resourcesByIdOrSelf.value.hits.hits;
        if (resultsLength) {
          setResources({
            next: null,
            // @ts-ignore
            resources: hits.map(hit => {
              return {
                ...JSON.parse(hit._source['_original_source']),
                '@id': hit._source['@id'],
              };
            }),
            total: resultsLength,
            busy: false,
            error: null,
          });
          return;
        }
      }
      if (resourcesResults.status === 'fulfilled') {
        setResources({
          next: null,
          // @ts-ignore
          resources: resourcesResults.value._results,
          total: resourcesResults.value._total,
          busy: false,
          error: null,
        });
      } else {
        setResources({
          next,
          resources,
          total,
          busy: false,
          error: resourcesResults.reason,
        });
      }
    })();
  }, [
    orgLabel,
    projectLabel,
    JSON.stringify(list.query),
    toggleForceReload,
    refreshList,
  ]);
  const handleDelete = () => {
    onDeleteList(list.id);
  };

  const handleUpdate = (list: ResourceBoardList) => {
    setPaginationState({ ...paginationState, currentPage: 1 });
    setList(list);
  };

  const handleClone = () => {
    onCloneList(list);
  };

  const handleRefreshList = () => {
    setToggleForceReload(!toggleForceReload);
  };

  const handleTypeChange = (value: string) => {
    setList({
      ...list,
      query: {
        ...list.query,
        type: !!value ? value : undefined,
        from: 0,
      },
    });
    setPaginationState({
      ...paginationState,
      currentPage: 1,
    });
  };

  const handleSchemaChange = (value: string) => {
    setList({
      ...list,
      query: {
        ...list.query,
        schema: !!value ? value : undefined,
        from: 0,
      },
    });
    setPaginationState({
      ...paginationState,
      currentPage: 1,
    });
  };

  const sortList = (option: string) => {
    setList({
      ...list,
      query: {
        ...list.query,
        sort: [option, '@id'],
        q: undefined,
      },
    });
  };

  const shareableLink = `${
    window.location.href
  }?shareList=${encodeShareableList(list)}`;

  const handlePageSizeChange = (pageSize: number) => {
    const query = {
      ...list.query,
    };
    query.size = pageSize;
    setList({
      ...list,
      query,
    });
    setPaginationState({ ...paginationState, pageSize });
  };

  return (
    <ResourceListComponent
      busy={busy}
      list={list}
      resources={resources}
      total={total}
      pageSize={paginationState.pageSize}
      currentPage={paginationState.currentPage}
      onPaginationChange={handlePaginationChange}
      onPageSizeChange={handlePageSizeChange}
      hasSearch={true}
      error={error}
      onUpdate={handleUpdate}
      onDelete={handleDelete}
      onClone={handleClone}
      onRefresh={handleRefreshList}
      onSortBy={sortList}
      makeResourceUri={makeResourceUri}
      goToResource={goToResource}
      schemaLinkContainer={SchemaLinkContainer}
      shareableLink={shareableLink}
    >
      <TypeDropdownFilterContainer
        deprecated={Boolean(list.query.deprecated)}
        orgLabel={orgLabel}
        projectLabel={projectLabel}
        onChange={handleTypeChange}
        value={list.query.type}
      />
      <SchemaDropdownFilterContainer
        deprecated={!!list.query.deprecated}
        orgLabel={orgLabel}
        projectLabel={projectLabel}
        onChange={handleSchemaChange}
        value={list.query.schema}
      />
    </ResourceListComponent>
  );
};

export default ResourceListContainer;
