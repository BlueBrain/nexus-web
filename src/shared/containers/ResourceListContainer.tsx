import * as React from 'react';
import { useHistory } from 'react-router-dom';
import { useNexus } from '@bbp/react-nexus';
import { ResourceList, Resource } from '@bbp/nexus-sdk';

import { ResourceBoardList } from './ResourceListBoardContainer';
import ResourceListComponent from '../components/ResourceList';
import { useSelector } from 'react-redux';
import { RootState } from '../store/reducers';

const ResourceListContainer: React.FunctionComponent<{
  orgLabel: string;
  projectLabel: string;
  defaultList: ResourceBoardList;
  // updateList: (list: ResourceBoardList) => void;
  onDeleteList: (id: string) => void;
  // cloneList: (list: ResourceBoardList) => void;
}> = ({ defaultList, orgLabel, projectLabel, onDeleteList }) => {
  const history = useHistory();
  const basePath = useSelector((state: RootState) => state.config.basePath);
  const [list, setList] = React.useState<ResourceBoardList>(defaultList);
  const [{ q }, setQuery] = React.useState<{
    q?: string;
  }>({});

  const makeResourceUri = (resourceId: string) => {
    return `${basePath}/${orgLabel}/${projectLabel}/resources/${encodeURIComponent(
      resourceId
    )}`;
  };

  const goToResource = (resourceId: string) => {
    history.push(makeResourceUri(resourceId));
  };

  const { loading: busy, error, data } = useNexus(
    nexus =>
      nexus.Resource.list(orgLabel, projectLabel, {
        q,
      }),
    [q]
  );

  const handleLoadMore = ({ searchValue }: { searchValue: string }) => {
    setQuery({ q: searchValue });
  };

  const handleDelete = () => {
    onDeleteList(list.id);
  };

  const handleUpdate = (list: ResourceBoardList) => {
    setList(list);
  };

  return (
    <ResourceListComponent
      busy={busy}
      list={list}
      resources={(data && data._results) || []}
      total={(data && data._total) || 0}
      error={error}
      onUpdate={handleUpdate}
      onLoadMore={handleLoadMore}
      onDelete={handleDelete}
      makeResourceUri={makeResourceUri}
      goToResource={goToResource}
    />
  );
};

export default ResourceListContainer;
