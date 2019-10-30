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
}> = ({ orgLabel, projectLabel }) => {
  const [resourceLists, setResourceLists] = React.useState<ResourceBoardList[]>(
    [DEFAULT_LIST]
  );

  const createList = () => {
    setResourceLists([...resourceLists, DEFAULT_LIST]);
  };

  return (
    <ResourceListBoardComponent createList={createList}>
      {resourceLists.map((list, index: number) => {
        return (
          <ResourceListContainer
            list={list}
            projectLabel={projectLabel}
            orgLabel={orgLabel}
          />
        );
      })}
    </ResourceListBoardComponent>
  );
};

export default ResourceListBoardContainer;
