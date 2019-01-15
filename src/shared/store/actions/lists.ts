import { ActionCreator, Action } from 'redux';
import { List } from '../reducers/lists';

export enum ListActionTypes {
  CREATE = 'LIST_CREATE',
  DELETE = 'LIST_DELETE',
  UPDATE = 'LIST_UPDATE',
  CHANGE_INDEX = 'LIST_CHANGE_INDEX',
}

interface FilterAction<T> extends Action<T> {
  filterKey: string;
}

interface PayloadAction<T, DATA> extends Action<T> {
  payload: DATA;
}

interface FilterPayloadAction<T, DATA> extends FilterAction<T> {
  payload: DATA;
}

type DeleteListAction = FilterPayloadAction<
  ListActionTypes.DELETE,
  { listIndex: number }
>;
type UpdateListAciton = FilterPayloadAction<
  ListActionTypes.UPDATE,
  { listIndex: number; list: List }
>;
type ChangeListIndexAction = FilterPayloadAction<
  ListActionTypes.CHANGE_INDEX,
  { listIndex: number; moveToIndex: number }
>;

export type ListActions =
  | FilterAction<ListActionTypes.CREATE>
  | DeleteListAction
  | UpdateListAciton
  | ChangeListIndexAction;

export const actionTypes = {
  CREATE: ListActionTypes.CREATE,
  DELETE: ListActionTypes.DELETE,
  UPDATE: ListActionTypes.UPDATE,
  CHANGE_INDEX: ListActionTypes.CHANGE_INDEX,
};

export const createList: ActionCreator<FilterAction<ListActionTypes.CREATE>> = (
  filterKey: string
) => ({
  filterKey,
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

export const updateList: ActionCreator<UpdateListAciton> = (
  filterKey: string,
  listIndex: number,
  list: List
) => ({
  filterKey,
  type: ListActionTypes.UPDATE,
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
  { orgAndProjectLabel: string }
>;

export type ProjectListActions = InitializeProjectList;

export const initializeProjectList: ActionCreator<InitializeProjectList> = (
  orgLabel: string,
  projectLabel: string
) => ({
  payload: { orgAndProjectLabel: orgLabel + projectLabel },
  type: ListsByProjectTypes.INITIALIZE_PROJECT_LIST,
});
