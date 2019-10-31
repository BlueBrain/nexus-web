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
    filters: {
      _constrainedBy?: string;
      '@type'?: string;
      _deprecated: boolean;
      showManagementResources: boolean;
      [key: string]: any;
    };
    textQuery?: string;
  };
};

export const DEFAULT_LIST: ResourceBoardList = {
  name: 'Default Query',
  view: DEFAULT_ELASTIC_SEARCH_VIEW_ID,
  id: 'default',
  query: {
    filters: {
      showManagementResources: false,
      _deprecated: false,
    },
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
    console.log({ id, filteredList });
    setResourceLists(filteredList);
  };

  return (
    <ResourceListBoardComponent createList={createList}>
      {resourceLists.map((list, index: number) => {
        return (
          <ResourceListContainer
            defaultList={list}
            projectLabel={projectLabel}
            orgLabel={orgLabel}
            onDeleteList={handleDeleteList}
          />
        );
      })}
    </ResourceListBoardComponent>
  );
};

export default ResourceListBoardContainer;
