import { Action, Reducer, combineReducers, AnyAction } from 'redux';
import { FetchableState, createFetchReducer } from './utils';
import { Resource, PaginationSettings, PaginatedList } from '@bbp/nexus-sdk';
import {
  ListActions,
  ListActionTypes,
  listActionPrefix,
  ListByProjectActions,
  ListsByProjectTypes,
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

const DEFAULT_VIEW = 'nxv:defaultElasticSearchIndex';

export interface List {
  name: string;
  view: string;
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

export type ListState = List[];

export const DEFAULT_LIST: List = {
  name: 'Default Query',
  view: DEFAULT_VIEW,
  query: {
    filters: {},
  },
  request: {
    isFetching: false,
    data: null,
    error: null,
  },
};

export const initialListState: ListState = [DEFAULT_LIST]; // Get Initial State from URL or DEFAULT_LIST?

const queryReducerByIndex = createByIndex(
  action => action.hasOwnProperty('filterIndex'),
  (action: { filterIndex: number }) => action.filterIndex
)(combineReducers({ request: createFetchReducer(actionTypes) }));

export function listsReducer(
  state: ListState = initialListState,
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
      state.push(newList);
      return state;
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

const listReducerByKey = createByKey(
  action =>
    action.hasOwnProperty('filterKey') || action.hasOwnProperty('filterIndex'),
  (action: { filterKey: string }) => action.filterKey
)(listsReducer as Reducer);

export interface ListsByProjectState {
  [projectUUID: string]: ListState;
}

export default function listsByProjectReducer(
  state: ListsByProjectState = {},
  action: ListActions | ListByProjectActions | QueryActions | AnyAction
) {
  // Operate on the subreducers for a specific list
  if (
    action.type.startsWith(listActionPrefix) ||
    action.type.startsWith(queryResourcesActionPrefix)
  ) {
    return listReducerByKey(state, action);
  }

  // Create a new list
  switch (action.type) {
    case ListsByProjectTypes.INITIALIZE_PROJECT_LIST:
      return {
        ...state,
        [(action as ListByProjectActions).payload
          .projectUUID]: initialListState,
      };
    default:
      return state;
  }
}

export const persistanceExporter = (lists: ListsByProjectState) => {
  return Object.keys(lists).reduce((memo: ListsByProjectState, projectUUID) => {
    memo[projectUUID] = lists[projectUUID].map(list => ({
      ...list,
      // We don't want to cache the API responses, if they're saved there
      // Instead we just use the default null state.
      request: DEFAULT_LIST.request,
    }));
    return memo;
  }, {});
};
