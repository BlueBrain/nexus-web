import { ActionCreator, Dispatch, Action } from 'redux';
import { FetchFulfilledAction, FetchFailedAction } from './utils';
import {
  PaginatedList,
  Resource,
  Organization,
  Project,
  ElasticSearchView,
  PaginationSettings,
} from '@bbp/nexus-sdk';
import { ThunkAction } from '..';
import { RootState } from '../reducers';
import { updateList, makeOrgProjectFilterKey } from './lists';
import {
  ElasticSearchViewAggregationResponse,
  ElasticSearchViewQueryResponse,
} from '@bbp/nexus-sdk/lib/View/ElasticSearchView/types';
import { FetchableState } from '../reducers/utils';
import { List } from '../reducers/lists';
import { getProject } from '@bbp/nexus-sdk/lib/Project/utils';
import { isNumber } from 'util';

export const queryResourcesActionPrefix = 'QUERY';

enum QueryResourcesActionTypes {
  FETCHING = 'QUERY_RESOURCE_FETCHING',
  FULFILLED = 'QUERY_RESOURCE_FULFILLED',
  FAILED = 'QUERY_RESOURCE_FAILED',
}

export const actionTypes = {
  FETCHING: QueryResourcesActionTypes.FETCHING,
  FULFILLED: QueryResourcesActionTypes.FULFILLED,
  FAILED: QueryResourcesActionTypes.FAILED,
};

interface FilterFetchAction<T> extends Action<T> {
  type: T;
  filterIndex: number;
}
interface FilterFetchFulfilledAction<T, DATA>
  extends FetchFulfilledAction<T, DATA> {}
interface FilterFetchFailedAction<T> extends FetchFailedAction<T> {}

type FetchQueryAction = FilterFetchAction<QueryResourcesActionTypes.FETCHING>;
type FulfilledQueryAction = FilterFetchFulfilledAction<
  QueryResourcesActionTypes.FULFILLED,
  QueryResourcesFulfilledPayload
>;
type FailedQueryAction = FilterFetchFailedAction<
  QueryResourcesActionTypes.FAILED
>;

export type QueryActions =
  | FetchQueryAction
  | FulfilledQueryAction
  | FailedQueryAction;

const queryResourcesFetchAction: ActionCreator<FetchQueryAction> = (
  filterIndex: number,
  filterKey: string
) => ({
  filterIndex,
  filterKey,
  type: QueryResourcesActionTypes.FETCHING,
});

interface QueryResourcesFulfilledPayload {
  resources: PaginatedList<Resource>;
  schemas: string[];
  types: string[];
}

const queryResourcesFulfilledAction: ActionCreator<FulfilledQueryAction> = (
  filterIndex: number,
  filterKey: string,
  resources: PaginatedList<Resource>,
  schemas: any[],
  types: any[]
) => ({
  filterIndex,
  filterKey,
  type: QueryResourcesActionTypes.FULFILLED,
  payload: {
    resources,
    schemas,
    types,
  },
});

const queryResourcesFailedAction: ActionCreator<FailedQueryAction> = (
  filterIndex: number,
  filterKey: string,
  error: Error
) => ({
  filterIndex,
  filterKey,
  error,
  type: QueryResourcesActionTypes.FAILED,
});

// TODO break out into library
export const makeESQuery = (query?: { filters: any; textQuery?: string }) => {
  if (query) {
    const must = [];
    if (Object.keys(query.filters).length) {
      Object.keys(query.filters)
        .filter(key => !!query.filters[key])
        .forEach(key => {
          must.push({
            term: { [key]: query.filters[key] },
          });
        });
    }
    if (query.textQuery) {
      must.push({
        query_string: {
          query: `${query.textQuery}~`,
        },
      });
    }
    if (must.length > 1) {
      return {
        query: {
          bool: {
            must,
          },
        },
      };
    }
    if (must.length === 0) {
      return {};
    }
    return {
      query: {
        ...must[0],
      },
    };
  }
  return {};
};

export interface FilterQuery {
  filters: {};
  textQuery: string;
}

// TODO make higher order compositional function to add "WithFilterKey" or "WithFilterIndex"
export const queryResources: ActionCreator<ThunkAction> = (
  id: string,
  org: Organization,
  project: Project,
  paginationSettings: PaginationSettings,
  query?: FilterQuery
) => {
  return async (
    dispatch: Dispatch<any>,
    getState,
    { nexus }
  ): Promise<
    | FilterFetchFulfilledAction<
        QueryResourcesActionTypes.FULFILLED,
        QueryResourcesFulfilledPayload
      >
    | FilterFetchFailedAction<QueryResourcesActionTypes.FAILED>
  > => {
    const filterKey = makeOrgProjectFilterKey(org, project);
    const listState = (getState() as RootState).lists;
    const targetWorkspace = listState && listState[filterKey];
    const filterIndex = (targetWorkspace || []).findIndex(
      (list: List) => list.id === id
    );
    const list: List | undefined =
      (!!targetWorkspace && filterIndex >= 0 && targetWorkspace[filterIndex]) ||
      undefined;
    try {
      if (!list) {
        throw new Error(
          `no list found with id ${id} inside project ${project.label}`
        );
      }
      dispatch(
        updateList(filterKey, filterIndex, {
          ...list,
          query,
        })
      );
      dispatch(queryResourcesFetchAction(filterIndex, filterKey));
      const formattedQuery = makeESQuery(query);
      const realProject = await Project.get(org.label, project.label);
      const defaultElasticSearchView: ElasticSearchView = await realProject.getElasticSearchView();
      const resources: PaginatedList<
        Resource
      > = await defaultElasticSearchView.query(
        formattedQuery,
        paginationSettings
      );
      const aggregationQuery = {
        ...formattedQuery,
        aggs: {
          schemas: {
            terms: {
              size: 999,
              field: '_constrainedBy',
            },
          },
          types: {
            terms: {
              size: 999,
              field: '@type',
            },
          },
        },
      };
      const aggregationResponse: ElasticSearchViewAggregationResponse = await defaultElasticSearchView.aggregation(
        aggregationQuery
      );
      const schemas = aggregationResponse.aggregations.schemas.buckets.map(
        ({ doc_count, key }) => ({ key, count: doc_count })
      );
      const types = aggregationResponse.aggregations.types.buckets.map(
        ({ doc_count, key }) => ({ key, count: doc_count })
      );
      console.log({ resources, schemas, types });
      return dispatch(
        queryResourcesFulfilledAction(
          filterIndex,
          filterKey,
          resources,
          schemas,
          types
        )
      );
    } catch (e) {
      console.error(e);
      return dispatch(queryResourcesFailedAction(filterIndex, filterKey, e));
    }
  };
};
