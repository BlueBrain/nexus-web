import * as React from 'react';
import { useHistory } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useNexus } from '@bbp/react-nexus';
import { ResourceList, Resource } from '@bbp/nexus-sdk';

import { ResourceBoardList } from './ResourceListBoardContainer';
import ResourceListComponent from '../components/ResourceList';
import { RootState } from '../store/reducers';

const ResourceListContainer: React.FunctionComponent<{
  orgLabel: string;
  projectLabel: string;
  defaultList: ResourceBoardList;
  onDeleteList: (id: string) => void;
  onCloneList: (list: ResourceBoardList) => void;
}> = ({ defaultList, orgLabel, projectLabel, onDeleteList, onCloneList }) => {
  const history = useHistory();
  const basePath = useSelector((state: RootState) => state.config.basePath);
  const [list, setList] = React.useState<ResourceBoardList>(defaultList);
  const [toggleForceReload, setToggleForceReload] = React.useState(false);
  const makeResourceUri = (resourceId: string) => {
    return `${basePath}/${orgLabel}/${projectLabel}/resources/${encodeURIComponent(
      resourceId
    )}`;
  };

  const goToResource = (resourceId: string) => {
    history.push(makeResourceUri(resourceId));
  };

  const { loading: busy, error, data } = useNexus(
    nexus => nexus.Resource.list(orgLabel, projectLabel, list.query),
    [JSON.stringify(list.query), toggleForceReload]
  );

  const handleLoadMore = ({ searchValue }: { searchValue: string }) => {
    setList({
      ...list,
      query: {
        ...list.query,
        q: searchValue,
      },
    });
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
      onClone={handleClone}
      onRefresh={handleRefreshList}
      makeResourceUri={makeResourceUri}
      goToResource={goToResource}
    />
  );
};

export default ResourceListContainer;
