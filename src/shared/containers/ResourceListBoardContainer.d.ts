import * as React from 'react';
import { ResourceBoardList } from '../components/ResourceList';
export declare const DEFAULT_LIST: ResourceBoardList;
declare const ResourceListBoardContainer: React.FunctionComponent<{
  orgLabel: string;
  projectLabel: string;
  refreshLists?: boolean;
}>;
export default ResourceListBoardContainer;
