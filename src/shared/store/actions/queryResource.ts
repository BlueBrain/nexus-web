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
import { updateList } from './lists';
import {
  ElasticSearchViewAggregationResponse,
  ElasticSearchViewQueryResponse,
} from '@bbp/nexus-sdk/lib/View/ElasticSearchView';

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
  paginationSettings: PaginationSettings;
  _constrainedBy: any[];
  '@type': any[];
}

const queryResourcesFulfilledAction: ActionCreator<FulfilledQueryAction> = (
  filterIndex: number,
  filterKey: string,
  resources: PaginatedList<Resource>,
  paginationSettings: PaginationSettings,
  constrainedBy: any[],
  types: any[]
) => ({
  filterIndex,
  filterKey,
  type: QueryResourcesActionTypes.FULFILLED,
  payload: {
    resources,
    paginationSettings,
    _constrainedBy: constrainedBy,
    '@type': types,
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

// TODO make higher order compositional function to add "WithFilterKey" or "WithFilterIndex"
export const queryResources: ActionCreator<ThunkAction> = (
  filterIndex: number,
  filterKey: string,
  orgLabel: string,
  projectLabel: string,
  paginationSettings: PaginationSettings,
  query?: any
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
    const listState = (getState() as RootState).lists;
    if (query && listState) {
      const list = (listState as any)[filterKey][filterIndex];
      dispatch(
        updateList(orgLabel + projectLabel, filterIndex, {
          ...list,
          query,
        })
      );
    }
    dispatch(queryResourcesFetchAction(filterIndex, filterKey));
    try {
      if (!projectLabel || !orgLabel) {
        throw new Error('No active org or project');
      }
      const formattedQuery = makeESQuery(query);
      const org: Organization = await nexus.getOrganization(orgLabel);
      const project: Project = await org.getProject(projectLabel);
      const defaultElasticSearchView: ElasticSearchView = await project.getElasticSearchView();
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
      return dispatch(
        queryResourcesFulfilledAction(
          filterIndex,
          filterKey,
          resources,
          paginationSettings,
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
