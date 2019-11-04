import * as React from 'react';
import { DEFAULT_ELASTIC_SEARCH_VIEW_ID } from '@bbp/nexus-sdk';

import { uuidv4 } from '../utils';
import ResourceListBoardComponent from '../components/ResourceListBoard';
import ResourceListContainer from './ResourceListContainer';
import { ResourceBoardList } from '../components/ResourceList';

export const DEFAULT_LIST: ResourceBoardList = {
  name: 'Default Query',
  view: DEFAULT_ELASTIC_SEARCH_VIEW_ID,
  id: 'default',
  query: {
    size: 100,
    deprecated: false,
  },
};

const makeDefaultList = () => ({
  ...DEFAULT_LIST,
  id: uuidv4(),
});

const ResourceListBoardContainer: React.FunctionComponent<{
  orgLabel: string;
  projectLabel: string;
}> = ({ orgLabel, projectLabel }) => {
  const [resourceLists, setResourceLists] = React.useState<ResourceBoardList[]>(
    [makeDefaultList()]
  );

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

  return (
    <ResourceListBoardComponent createList={createList}>
      {resourceLists.map((list, index: number) => {
        return (
          <ResourceListContainer
            key={list.id}
            defaultList={list}
            projectLabel={projectLabel}
            orgLabel={orgLabel}
            onDeleteList={handleDeleteList}
            onCloneList={handleCloneList}
          />
        );
      })}
    </ResourceListBoardComponent>
  );
};

export default ResourceListBoardContainer;
