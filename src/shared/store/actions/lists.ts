import { ActionCreator, Action, Dispatch } from 'redux';
import { List } from '../reducers/lists';
import { FilterPayloadAction, FilterAction, PayloadAction } from './utils';
import { uuidv4 } from '../../utils';

export const listActionPrefix = 'LIST';

export enum ListActionTypes {
  CREATE = 'LIST_CREATE',
  DELETE = 'LIST_DELETE',
  UPDATE = 'LIST_UPDATE',
  CLONE = 'LIST_CLONE',
  CHANGE_INDEX = 'LIST_CHANGE_INDEX',
}

type CreateListAction = FilterPayloadAction<
  ListActionTypes.CREATE,
  { id: string }
>;
type DeleteListAction = FilterPayloadAction<
  ListActionTypes.DELETE,
  { listIndex: number }
>;
type UpdateListAction = FilterPayloadAction<
  ListActionTypes.UPDATE,
  { listIndex: number; list: List }
>;
type CloneListAction = FilterPayloadAction<
  ListActionTypes.CLONE,
  { listIndex: number; list: List }
>;
type ChangeListIndexAction = FilterPayloadAction<
  ListActionTypes.CHANGE_INDEX,
  { listIndex: number; moveToIndex: number }
>;

export type ListActions =
  | CreateListAction
  | DeleteListAction
  | UpdateListAction
  | CloneListAction
  | ChangeListIndexAction;

export const actionTypes = {
  CREATE: ListActionTypes.CREATE,
  DELETE: ListActionTypes.DELETE,
  UPDATE: ListActionTypes.UPDATE,
  CLONE: ListActionTypes.CLONE,
  CHANGE_INDEX: ListActionTypes.CHANGE_INDEX,
};

export const createList: ActionCreator<CreateListAction> = (
  filterKey: string
) => ({
  filterKey,
  payload: { id: uuidv4() },
  type: ListActionTypes.CREATE,
});

export const deleteList: ActionCreator<DeleteListAction> = (
  filterKey: string,
  listIndex: number
) => ({
  filterKey,
  payload: { listIndex },
  type: ListActionTypes.DELETE,
});

export const updateList: ActionCreator<UpdateListAction> = (
  filterKey: string,
  listIndex: number,
  list: List
) => ({
  filterKey,
  type: ListActionTypes.UPDATE,
  payload: { listIndex, list },
});

export const cloneList: ActionCreator<CloneListAction> = (
  filterKey: string,
  listIndex: number,
  list: List
) => ({
  filterKey,
  type: ListActionTypes.CLONE,
  payload: { listIndex, list },
});

export const changeIndex: ActionCreator<ChangeListIndexAction> = (
  filterKey: string,
  listIndex: number,
  moveToIndex: number
) => ({
  filterKey,
  type: ListActionTypes.CHANGE_INDEX,
  payload: { listIndex, moveToIndex },
});

// Project List

export enum ListsByProjectTypes {
  INITIALIZE_PROJECT_LIST = 'INITIALIZE_PROJECT_LIST',
}

type InitializeProjectList = PayloadAction<
  ListsByProjectTypes.INITIALIZE_PROJECT_LIST,
  { orgAndProjectLabel: string; id: string }
>;

export type ProjectListActions = InitializeProjectList;

export const initializeProjectList: ActionCreator<InitializeProjectList> = (
  orgLabel: string,
  projectLabel: string
) => ({
  payload: { orgAndProjectLabel: orgLabel + projectLabel, id: uuidv4() },
  type: ListsByProjectTypes.INITIALIZE_PROJECT_LIST,
});
