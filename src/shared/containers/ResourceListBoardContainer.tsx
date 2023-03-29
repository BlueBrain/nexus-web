import * as React from 'react';
import { useSelector } from 'react-redux';
import { message } from 'antd';
import { DEFAULT_ELASTIC_SEARCH_VIEW_ID } from '@bbp/nexus-sdk';

import { uuidv4 } from '../utils';
import ResourceListBoardComponent from '../components/ResourceListBoard';
import ResourceListContainer, {
  decodeShareableList,
} from './ResourceListContainer';
import { ResourceBoardList } from '../components/ResourceList';
import useLocalStorage from '../hooks/useLocalStorage';
import { RootState } from '../store/reducers';
import useQueryString from '../hooks/useQueryString';

export const DEFAULT_LIST: ResourceBoardList = {
  name: 'Default Query',
  view: DEFAULT_ELASTIC_SEARCH_VIEW_ID,
  id: 'default',
  query: {
    size: 6,
    deprecated: undefined,
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
  const [{ shareList }, setQueryParams] = useQueryString();

  const [resourceLists = [], setResourceLists] = useLocalStorage<
    ResourceBoardList[]
  >(`resource-lists-${userId}-${orgLabel}-${projectLabel}`, [
    makeDefaultList(),
  ]);

  React.useEffect(() => {
    const sharedList = shareList && decodeShareableList(shareList);

    if (sharedList) {
      setResourceLists([
        {
          ...sharedList,
          id: uuidv4(),
        },
        ...resourceLists,
      ]);
      message.success(
        <span>
          Added a new shared query list called <em>{sharedList.name}</em>
        </span>
      );
      setQueryParams({ shareList: undefined });
    }
  }, [orgLabel, projectLabel, shareList]);

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
    setResourceLists(lists => {
      if (lists === undefined) return [updatedList];
      const index = lists.findIndex(list => list.id === updatedList.id);
      const newResourceList = [...lists];
      newResourceList[index] = updatedList;
      return newResourceList;
    });
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
