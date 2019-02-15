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

// serialize / deserialze to URL param
// maybe with middleware?
// when something inside lists changes (inisde query, the input)
// then we should update the URL with a serialied array of queries
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
  // if (action.type.startsWith(queryResourcesActionPrefix)) {
  //   return queryReducerByIndex(state, action as FilterIndexAction);
  // }

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

export interface ListsByProjectState extends Map<string, ListState> {}

export default function listsByProjectReducer(
  state: ListsByProjectState = new Map(),
  action: ListActions | ListByProjectActions | QueryActions | AnyAction
) {
  // Operate on the subreducers for a specific list
  if (
    action.hasOwnProperty('filterKey') ||
    (action.hasOwnProperty('filterIndex') &&
      (action.type.startsWith(listActionPrefix) ||
        action.type.startsWith(queryResourcesActionPrefix)))
  ) {
    const projectUUID = (action as ListActions).filterKey;
    return state.set(
      projectUUID,
      listsReducer(state.get(projectUUID), action as QueryActions | ListActions)
    );
  }

  // Create a new list
  switch (action.type) {
    case ListsByProjectTypes.INITIALIZE_PROJECT_LIST:
      const key = (action as ListByProjectActions).payload.projectUUID;
      state.set(key, initialListState);
      return state;
    default:
      return state;
  }
}

export const persistanceLoader = (
  listsFrom:
    | {
        [projectUUID: string]: ListState;
      }
    | undefined
): ListsByProjectState => {
  const state = new Map();
  if (!listsFrom) {
    return state;
  }
  Object.keys(listsFrom).forEach(projectUUID => {
    state.set(projectUUID, listsFrom[projectUUID]);
  });
  return state;
};

export const persistanceExporter = (
  lists: ListsByProjectState
): { [projectUUID: string]: ListState } => {
  const exportState: { [projectUUID: string]: ListState } = {};
  lists.forEach((listsState, projectUUID) => {
    exportState[projectUUID] = listsState.map(list => ({
      ...list,
      // We don't want to cache the API responses, if they're saved there
      // Instead we just use the default null state.
      request: DEFAULT_LIST.request,
    }));
  });
  return exportState;
};
