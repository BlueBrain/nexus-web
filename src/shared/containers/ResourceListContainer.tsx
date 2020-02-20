import * as React from 'react';
import { useHistory, useLocation } from 'react-router-dom';
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

  const makeResourceUri = (resourceId: string) => {
    return `/${orgLabel}/${projectLabel}/resources/${encodeURIComponent(
      resourceId
    )}`;
  };

  const goToResource = (resourceId: string) => {
    history.push(makeResourceUri(resourceId), { background: location });
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
    const query = {
      ...list.query,
      q: searchValue,
    };

    if (searchValue) {
      query.sort = undefined;
    }

    if (searchValue !== list.query.q) {
      return setList({
        ...list,
        query,
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

  const shareableLink = `${window.location.href}?shareList=${btoa(
    JSON.stringify(list)
  )}`;

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
      onSortBy={sortList}
      makeResourceUri={makeResourceUri}
      goToResource={goToResource}
      schemaLinkContainer={SchemaLinkContainer}
      shareableLink={shareableLink}
    >
      <TypeDropdownFilterContainer
        deprecated={!!list.query.deprecated}
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
