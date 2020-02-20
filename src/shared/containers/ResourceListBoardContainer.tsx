import * as React from 'react';
import { useSelector } from 'react-redux';
import { message } from 'antd';
import { DEFAULT_ELASTIC_SEARCH_VIEW_ID } from '@bbp/nexus-sdk';

import { uuidv4 } from '../utils';
import ResourceListBoardComponent from '../components/ResourceListBoard';
import ResourceListContainer from './ResourceListContainer';
import { ResourceBoardList } from '../components/ResourceList';
import useLocalStorage from '../hooks/useLocalStorage';
import { RootState } from '../store/reducers';
import useQueryString from '../hooks/useQueryString';

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
  const [{ shareList }, setQueryParams] = useQueryString();

  const [resourceLists = [], setResourceLists] = useLocalStorage<
    ResourceBoardList[]
  >(`resource-lists-${userId}`, [makeDefaultList()]);

  React.useEffect(() => {
    const sharedList = shareList && JSON.parse(atob(shareList));
    if (sharedList) {
      setResourceLists([sharedList, ...resourceLists]);
      message.success(
        <span>
          Added a new shared query list called <em>{sharedList.name}</em>
        </span>
      );
    }

    setQueryParams({ shareList: undefined });
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
    const index = resourceLists.findIndex(list => list.id === updatedList.id);

    const newResourceList = [...resourceLists];
    newResourceList[index] = updatedList;

    setResourceLists(newResourceList);
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
