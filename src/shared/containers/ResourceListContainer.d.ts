import * as React from 'react';
import { ResourceBoardList } from '../components/ResourceList';
export declare const encodeShareableList: (list: ResourceBoardList) => string;
export declare const decodeShareableList: (base64string: string) => any;
declare const ResourceListContainer: React.FunctionComponent<{
  orgLabel: string;
  projectLabel: string;
  refreshList?: boolean;
  onDeleteList: (id: string) => void;
  onCloneList: (list: ResourceBoardList) => void;
  list: ResourceBoardList;
  setList: (list: ResourceBoardList) => void;
}>;
export default ResourceListContainer;
