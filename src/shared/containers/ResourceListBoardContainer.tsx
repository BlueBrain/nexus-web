import * as React from 'react';
import { DEFAULT_ELASTIC_SEARCH_VIEW_ID } from '@bbp/nexus-sdk';

import { uuidv4 } from '../utils';
import ResourceListBoardComponent from '../components/ResourceListBoard';
import ResourceListContainer from './ResourceListContainer';

export type ResourceBoardList = {
  name: string;
  view: string;
  id: string;
  query: {
    from?: number;
    size?: number;
    deprecated?: boolean;
    rev?: number;
    type?: string;
    createdBy?: string;
    updatedBy?: string;
    schema?: string;
    q?: string;
  };
};

export const DEFAULT_LIST: ResourceBoardList = {
  name: 'Default Query',
  view: DEFAULT_ELASTIC_SEARCH_VIEW_ID,
  id: 'default',
  query: {
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
