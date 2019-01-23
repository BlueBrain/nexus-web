import { Action, Reducer, combineReducers } from 'redux';
import { FetchableState, createFetchReducer } from './utils';
import { Resource, PaginationSettings, PaginatedList } from '@bbp/nexus-sdk';
import {
  ListActions,
  ListActionTypes,
  ProjectListActions,
  listActionPrefix,
} from '../actions/lists';
import { moveTo } from '../../utils';
import {
  createByKey,
  createByIndex,
  FilterIndexAction,
} from './utils/createByKey';
import {
  actionTypes,
  QueryActions,
  queryResourcesActionPrefix,
} from '../actions/queryResource';

export interface List {
  name: string;
  query: {
    filters: {
      [filterKey: string]: string[];
    };
    textQuery?: string;
  };
  request: FetchableState<{
    resources: PaginatedList<Resource>;
    paginationSettings: PaginationSettings;
    _constrainedBy: any[];
    '@type': any[];
  }>;
}

// serialize / deserialze to URL param
// maybe with middleware?
// when something inside lists changes (inisde query, the input)
// then we should update the URL with a serialied array of queries
export type ListState = List[];

const DEFAULT_LIST: List = {
  name: 'Default Query',
  query: {
    filters: {},
  },
  request: {
    isFetching: false,
    data: null,
    error: null,
  },
};

const initialState: ListState = [DEFAULT_LIST]; // Get Initial State from URL or DEFAULT_LIST?

const queryReducerByIndex = createByIndex(
  action => action.hasOwnProperty('filterIndex'),
  (action: { filterIndex: number }) => action.filterIndex
)(combineReducers({ request: createFetchReducer(actionTypes) }));

export function listsReducer(
  state: ListState = initialState,
  action: ListActions | QueryActions
) {
  if (action.type.startsWith(queryResourcesActionPrefix)) {
    return queryReducerByIndex(state, action as FilterIndexAction);
  }

  switch (action.type) {
    case ListActionTypes.CREATE:
      const newList = {
        ...DEFAULT_LIST,
        name: `New Query ${state.length + 1}`,
      };
      return [...state, newList];
    case ListActionTypes.DELETE:
      return [
        ...state.slice(0, action.payload.listIndex),
        ...state.slice(action.payload.listIndex + 1),
      ];
    case ListActionTypes.UPDATE:
      return [
        ...state.map((list, listIndex) =>
          listIndex === action.payload.listIndex ? action.payload.list : list
        ),
      ];
    case ListActionTypes.CLONE:
      const clonedList = {
        ...action.payload.list,
        name: `Clone of ${action.payload.list.name}`,
      };
      if (state.length === 1) {
        return [...state.concat(clonedList)];
      }
      state.splice(action.payload.listIndex + 1, 0, clonedList);
      return [...state];
    case ListActionTypes.CHANGE_INDEX:
      return [
        ...moveTo(state, action.payload.listIndex, action.payload.moveToIndex),
      ];
    default:
      return state;
  }
}

export interface ListsByProjectState {
  [orgProjectFilterKey: string]: ListState;
}

const listReducerByKey = createByKey(
  action =>
    action.hasOwnProperty('filterKey') || action.hasOwnProperty('filterIndex'),
  (action: { filterKey: string }) => action.filterKey
)(listsReducer as Reducer);

export default function listsByProjectReducer(
  state: ListsByProjectState = {},
  action: ListActions | ProjectListActions | QueryActions
) {
  if (
    action.type.startsWith(listActionPrefix) ||
    action.type.startsWith(queryResourcesActionPrefix)
  ) {
    return listReducerByKey(state, action);
  }

  switch (action.type) {
    case 'INITIALIZE_PROJECT_LIST':
      return {
        ...state,
        [action.payload.orgAndProjectLabel]: initialState,
      };
    default:
      return state;
  }
}
