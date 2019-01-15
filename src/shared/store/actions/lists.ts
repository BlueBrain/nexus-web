import { ActionCreator, Action } from 'redux';
import { List } from '../reducers/lists';

export enum ListActionTypes {
  CREATE = 'LIST_CREATE',
  DELETE = 'LIST_DELETE',
  UPDATE = 'UPDATE',
  CHANGE_INDEX = 'CHANGE_INDEX',
}

interface PayloadAction<T, DATA> extends Action<T> {
  payload: DATA;
}

type DeleteListAction = PayloadAction<
  ListActionTypes.DELETE,
  { listIndex: number }
>;
type UpdateListAciton = PayloadAction<
  ListActionTypes.UPDATE,
  { listIndex: number; list: List }
>;
type ChangeListIndexAction = PayloadAction<
  ListActionTypes.CHANGE_INDEX,
  { listIndex: number; moveToIndex: number }
>;

export type ListActions =
  | Action<ListActionTypes.CREATE>
  | DeleteListAction
  | UpdateListAciton
  | ChangeListIndexAction;

export const actionTypes = {
  CREATE: ListActionTypes.CREATE,
  DELETE: ListActionTypes.DELETE,
  UPDATE: ListActionTypes.UPDATE,
  CHANGE_INDEX: ListActionTypes.CHANGE_INDEX,
};

export const createList: ActionCreator<
  Action<ListActionTypes.CREATE>
> = () => ({
  type: ListActionTypes.CREATE,
});

export const deleteList: ActionCreator<DeleteListAction> = (
  listIndex: number
) => ({
  payload: { listIndex },
  type: ListActionTypes.DELETE,
});

export const updateList: ActionCreator<UpdateListAciton> = (
  listIndex: number,
  list: List
) => ({
  type: ListActionTypes.UPDATE,
  payload: { listIndex, list },
});

export const changeIndex: ActionCreator<ChangeListIndexAction> = (
  listIndex: number,
  moveToIndex: number
) => ({
  type: ListActionTypes.CHANGE_INDEX,
  payload: { listIndex, moveToIndex },
});
