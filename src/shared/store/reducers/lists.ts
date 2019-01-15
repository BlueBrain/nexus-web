import { Action } from 'redux';
import { FetchableState } from './utils';
import { Resource, PaginationSettings, PaginatedList } from '@bbp/nexus-sdk';
import { ListActions, ListActionTypes } from '../actions/lists';
import { moveTo } from '../../utils';

export interface List extends FetchableState<PaginatedList<Resource>> {
  name: string;
  query: {
    filters: {
      [filterKey: string]: string[];
    };
    textQuery?: string;
  };
  paginationSettings: PaginationSettings;
}

// serialize / deserialze to URL param
// maybe with middleware?
// when something inside lists changes (inisde query, the input)
// then we should update the URL with a serialied array of queries
export type ListState = List[];

const DEFAULT_RESOURCE_PAGINATION_SIZE = 20;

const DEFAULT_PAGINATION_SETTINGS = {
  from: 0,
  size: DEFAULT_RESOURCE_PAGINATION_SIZE,
};

const DEFAULT_LIST: List = {
  name: 'Default List',
  query: {
    filters: {},
  },
  isFetching: true,
  paginationSettings: DEFAULT_PAGINATION_SETTINGS,
  data: null,
  error: null,
};

const initialState: ListState = [DEFAULT_LIST]; // Get Initial State from URL or DEFAULT_LIST?

export default function listsReducer(
  state: ListState = initialState,
  action: ListActions
) {
  switch (action.type) {
    case ListActionTypes.CREATE:
      const newList = { ...DEFAULT_LIST, name: `New List ${state.length + 1}` };
      return [...state, newList];
    case ListActionTypes.DELETE:
      return [
        ...state.filter(
          (list, listIndex) => listIndex !== action.payload.listIndex
        ),
      ];
    case ListActionTypes.UPDATE:
      return [
        ...state.map((list, listIndex) =>
          listIndex === action.payload.listIndex ? action.payload.list : list
        ),
      ];
    case ListActionTypes.CHANGE_INDEX:
      return [
        ...moveTo(state, action.payload.listIndex, action.payload.moveToIndex),
      ];
    default:
      return state;
  }
}
