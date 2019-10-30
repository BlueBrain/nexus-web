import * as React from 'react';
import { useNexus } from '@bbp/react-nexus';
import { ResourceList, Resource } from '@bbp/nexus-sdk';

import { ResourceBoardList } from './ResourceListBoardContainer';
import ResourceListComponent from '../components/ResourceList';

const ResourceListContainer: React.FunctionComponent<{
  orgLabel: string;
  projectLabel: string;
  list: ResourceBoardList;
  // updateList: (list: ResourceBoardList) => void;
  // deleteList: () => void;
  // cloneList: (list: ResourceBoardList) => void;
}> = ({ list, orgLabel, projectLabel }) => {
  const { loading: busy, error, data } = useNexus(nexus =>
    nexus.Resource.list(orgLabel, projectLabel)
  );

  const handleLoadMore = () => {};

  const handleDelete = () => {};

  return (
    <ResourceListComponent
      busy={busy}
      list={list}
      resources={(data && data._results) || []}
      total={(data && data._total) || 0}
      error={error}
      onLoadMore={handleLoadMore}
      onDelete={handleDelete}
    />
  );
};

export default ResourceListContainer;
