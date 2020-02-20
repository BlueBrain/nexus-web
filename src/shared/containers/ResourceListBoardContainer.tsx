import * as React from 'react';
import { DEFAULT_ELASTIC_SEARCH_VIEW_ID } from '@bbp/nexus-sdk';

import { uuidv4 } from '../utils';
import ResourceListBoardComponent from '../components/ResourceListBoard';
import ResourceListContainer from './ResourceListContainer';
import { ResourceBoardList } from '../components/ResourceList';
import useLocalStorage from '../hooks/useLocalStorage';
import { useSelector } from 'react-redux';
import { RootState } from '../store/reducers';

export const DEFAULT_LIST: ResourceBoardList = {
  name: 'Default Query',
  view: DEFAULT_ELASTIC_SEARCH_VIEW_ID,
  id: 'default',
  query: {
    size: 100,
    deprecated: false,
    sort: '-_createdAt',
  },
};

const makeDefaultList = () => ({
  ...DEFAULT_LIST,
  id: uuidv4(),
});

const ResourceListBoardContainer: React.FunctionComponent<{
  orgLabel: string;
  projectLabel: string;
  refreshLists?: boolean;
}> = ({ orgLabel, projectLabel, refreshLists }) => {
  const userId = useSelector(
    (state: RootState) => state.oidc.user?.profile.sub
  );
  const [resourceLists = [], setResourceLists] = useLocalStorage<
    ResourceBoardList[]
  >(`resource-lists-${userId}`, [makeDefaultList()]);

  const createList = () => {
    setResourceLists([...resourceLists, makeDefaultList()]);
  };

  const handleDeleteList = (id: string) => {
    const filteredList = resourceLists.filter(list => list.id !== id);
    setResourceLists(filteredList);
  };

  const handleCloneList = (list: ResourceBoardList) => {
    setResourceLists([
      ...resourceLists,
      { ...list, id: uuidv4(), name: `clone of ${list.name}` },
    ]);
  };

  const handleListChanged = (updatedList: ResourceBoardList) => {
    setResourceLists([
      ...resourceLists.filter(list => list.id !== updatedList.id),
      updatedList,
    ]);
  };

  return (
    <ResourceListBoardComponent createList={createList}>
      {resourceLists.map((list, index: number) => {
        return (
          <ResourceListContainer
            refreshList={refreshLists}
            key={list.id}
            projectLabel={projectLabel}
            orgLabel={orgLabel}
            onDeleteList={handleDeleteList}
            onCloneList={handleCloneList}
            list={list}
            setList={handleListChanged}
          />
        );
      })}
    </ResourceListBoardComponent>
  );
};

export default ResourceListBoardContainer;
