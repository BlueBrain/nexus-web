import * as React from 'react';
import { DEFAULT_ELASTIC_SEARCH_VIEW_ID } from '@bbp/nexus-sdk';

import { uuidv4 } from '../utils';
import ResourceListBoardComponent from '../components/ResourceListBoard';

export type ResourceList = {
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

export const DEFAULT_LIST: ResourceList = {
  name: 'Default Query',
  view: DEFAULT_ELASTIC_SEARCH_VIEW_ID,
  id: uuidv4(),
  query: {
    filters: {
      showManagementResources: false,
      _deprecated: false,
    },
  },
};

const ResourceListBoardContainer: React.FunctionComponent<{
  orgLabel: string;
  projectLabel: string;
}> = props => {
  const [resourceLists, setResourceLists] = React.useState<ResourceList[]>([
    DEFAULT_LIST,
  ]);

  const createList = () => {
    setResourceLists([...resourceLists, DEFAULT_LIST]);
  };

  return (
    <ResourceListBoardComponent createList={createList}>
      {resourceLists.map((list, index: number) => {
        // We don't need to pass these down
        // const { lists, project, org, ...filteredProps } = props;
        // return (
        //   <Query
        //     {...{
        //       ...filteredProps,
        //       list,
        //       updateList: (list: List) => updateList(index, list),
        //       deleteList: () => deleteList(index),
        //       cloneList: (list: List) => cloneList(index, list),
        //     }}
        //     key={list.id}
        //   />
        // );
        return <h1>hello I am {list.name}</h1>;
      })}
    </ResourceListBoardComponent>
  );
};

export default ResourceListBoardContainer;
