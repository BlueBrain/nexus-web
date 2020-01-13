import * as React from 'react';
import { useHistory } from 'react-router-dom';
import { useNexusContext } from '@bbp/react-nexus';
import { Resource } from '@bbp/nexus-sdk';

import ResourceListComponent, {
  ResourceBoardList,
} from '../components/ResourceList';
import TypeDropdownFilterContainer from './TypeDropdownFilter';
import SchemaDropdownFilterContainer from './SchemaDropdownFilters';
import SchemaLinkContainer from './SchemaLink';

const ResourceListContainer: React.FunctionComponent<{
  orgLabel: string;
  projectLabel: string;
  defaultList: ResourceBoardList;
  refreshList?: boolean;
  onDeleteList: (id: string) => void;
  onCloneList: (list: ResourceBoardList) => void;
}> = ({
  defaultList,
  orgLabel,
  projectLabel,
  onDeleteList,
  onCloneList,
  refreshList,
}) => {
  const nexus = useNexusContext();
  const history = useHistory();
  const [list, setList] = React.useState<ResourceBoardList>(defaultList);
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

  const makeResourceUri = (resourceId: string) => {
    return `/${orgLabel}/${projectLabel}/resources/${encodeURIComponent(
      resourceId
    )}`;
  };

  const goToResource = (resourceId: string) => {
    history.push(makeResourceUri(resourceId));
  };

  React.useEffect(() => {
    setResources({
      next,
      resources,
      total,
      busy: true,
      error: null,
    });

    let resourceListResponse: any = [];

    nexus.Resource.list(orgLabel, projectLabel, list.query)
      .then(response => {
        resourceListResponse = response;
        setResources({
          next: resourceListResponse._next || null,
          resources: resourceListResponse._results,
          total: resourceListResponse._total,
          busy: false,
          error: null,
        });
      })
      .catch(error => {
        setResources({
          next,
          error,
          resources,
          total,
          busy: false,
        });
      });
  }, [
    // Reset pagination and reload based on these props
    orgLabel,
    projectLabel,
    JSON.stringify(list.query),
    toggleForceReload,
    refreshList,
  ]);

  const handleLoadMore = async ({ searchValue }: { searchValue: string }) => {
    if (searchValue !== list.query.q) {
      return setList({
        ...list,
        query: {
          ...list.query,
          q: searchValue,
        },
      });
    }
    if (busy || !next) {
      return;
    }
    try {
      setResources({
        next,
        resources,
        total,
        busy: true,
        error: null,
      });
      const response = await nexus.httpGet({
        path: next,
      });
      setResources({
        next: response._next || null,
        resources: [...resources, ...response._results],
        total: response._total,
        busy: false,
        error: null,
      });
    } catch (error) {
      setResources({
        next,
        error,
        resources,
        total,
        busy: false,
      });
    }
  };

  const handleDelete = () => {
    onDeleteList(list.id);
  };

  const handleUpdate = (list: ResourceBoardList) => {
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
      },
    });
  };

  const handleSchemaChange = (value: string) => {
    setList({
      ...list,
      query: {
        ...list.query,
        schema: !!value ? value : undefined,
      },
    });
  };

  const sortList = () => {
    setList({
      ...list,
      query: {
        ...list.query,
        // @ts-ignore
        sort: list.query.sort === '-_createdAt' ? '_createdAt' : '-_createdAt',
      },
    });
  };

  return (
    <ResourceListComponent
      busy={busy}
      list={list}
      resources={resources}
      total={total}
      error={error}
      onUpdate={handleUpdate}
      onLoadMore={handleLoadMore}
      onDelete={handleDelete}
      onClone={handleClone}
      onRefresh={handleRefreshList}
      onSort={sortList}
      makeResourceUri={makeResourceUri}
      goToResource={goToResource}
      schemaLinkContainer={SchemaLinkContainer}
    >
      <TypeDropdownFilterContainer
        deprecated={!!list.query.deprecated}
        orgLabel={orgLabel}
        projectLabel={projectLabel}
        onChange={handleTypeChange}
      />
      <SchemaDropdownFilterContainer
        deprecated={!!list.query.deprecated}
        orgLabel={orgLabel}
        projectLabel={projectLabel}
        onChange={handleSchemaChange}
      />
    </ResourceListComponent>
  );
};

export default ResourceListContainer;
