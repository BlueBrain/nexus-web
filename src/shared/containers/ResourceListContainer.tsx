import * as React from 'react';
import { useHistory } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useAsyncEffect } from 'use-async-effect';
import { useNexusContext } from '@bbp/react-nexus';
import { Resource } from '@bbp/nexus-sdk';

import ResourceListComponent, {
  ResourceBoardList,
} from '../components/ResourceList';
import { RootState } from '../store/reducers';
import TypeDropdownFilterContainer from './TypeDropdownFilter';
import SchemaDropdownFilterContainer from './SchemaDropdownFilters';

const ResourceListContainer: React.FunctionComponent<{
  orgLabel: string;
  projectLabel: string;
  defaultList: ResourceBoardList;
  onDeleteList: (id: string) => void;
  onCloneList: (list: ResourceBoardList) => void;
}> = ({ defaultList, orgLabel, projectLabel, onDeleteList, onCloneList }) => {
  const nexus = useNexusContext();
  const history = useHistory();
  const basePath = useSelector((state: RootState) => state.config.basePath);
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
    return `${basePath}/${orgLabel}/${projectLabel}/resources/${encodeURIComponent(
      resourceId
    )}`;
  };

  const goToResource = (resourceId: string) => {
    history.push(makeResourceUri(resourceId));
  };

  useAsyncEffect(
    async isMounted => {
      if (!isMounted()) {
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
        const response = await nexus.Resource.list(
          orgLabel,
          projectLabel,
          list.query
        );
        setResources({
          next: response._next || null,
          resources: response._results,
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
    },
    [
      // Reset pagination and reload based on these props
      orgLabel,
      projectLabel,
      JSON.stringify(list.query),
      toggleForceReload,
    ]
  );

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
      makeResourceUri={makeResourceUri}
      goToResource={goToResource}
    >
      <TypeDropdownFilterContainer
        orgLabel={orgLabel}
        projectLabel={projectLabel}
        onChange={handleTypeChange}
      />
      <SchemaDropdownFilterContainer
        orgLabel={orgLabel}
        projectLabel={projectLabel}
        onChange={handleSchemaChange}
      />
    </ResourceListComponent>
  );
};

export default ResourceListContainer;
