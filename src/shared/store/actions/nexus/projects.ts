import { Action, ActionCreator, Dispatch } from 'redux';
import { Project } from '@bbp/nexus-sdk';
import { ThunkAction } from '../..';
import { FetchAction, FetchFulfilledAction, FetchFailedAction } from '../utils';
import ElasticSearchView, {
  ElasticSearchViewAggregationResponse,
} from '@bbp/nexus-sdk/lib/View/ElasticSearchView';

const DEFAULT_AGG_TERM_SIZE = 999;

enum ProjectActionTypes {
  FETCHING = '@@nexus/PROJECT_FETCHING',
  FULFILLED = '@@nexus/PROJECT_FETHCING_FULFILLED',
  FAILED = '@@nexus/PROJECT_FETCHING_FAILED',
}

export const actionTypes = {
  FETCHING: ProjectActionTypes.FETCHING,
  FULFILLED: ProjectActionTypes.FULFILLED,
  FAILED: ProjectActionTypes.FAILED,
};

const fetchProjectsAction: ActionCreator<
  FetchAction<ProjectActionTypes.FETCHING>
> = () => ({
  type: ProjectActionTypes.FETCHING,
});

const fetchProjectsFulfilledAction: ActionCreator<
  FetchFulfilledAction<ProjectActionTypes.FULFILLED, Project>
> = (project: Project) => ({
  type: ProjectActionTypes.FULFILLED,
  payload: project,
});

const fetchProjectsFailedAction: ActionCreator<
  FetchFailedAction<ProjectActionTypes.FAILED>
> = (error: Error) => ({
  error,
  type: ProjectActionTypes.FAILED,
});

export type ProjectActions =
  | FetchAction<ProjectActionTypes.FETCHING>
  | FetchFulfilledAction<ProjectActionTypes.FULFILLED, Project>
  | FetchFailedAction<ProjectActionTypes.FAILED>;

export const fetchAndAssignProject: ActionCreator<ThunkAction> = (
  orgLabel: string,
  projectLabel: string
) => {
  return async (
    dispatch: Dispatch<any>
  ): Promise<
    | FetchFulfilledAction<ProjectActionTypes.FULFILLED, Project>
    | FetchFailedAction<ProjectActionTypes.FAILED>
  > => {
    dispatch(fetchProjectsAction());
    try {
      const project: Project = await Project.get(orgLabel, projectLabel);
      const defaultElasticSearchView: ElasticSearchView = await project.getElasticSearchView();
      const aggregationQuery = {
        aggs: {
          schemas: {
            terms: {
              size: DEFAULT_AGG_TERM_SIZE,
              field: '_constrainedBy',
            },
          },
          types: {
            terms: {
              size: DEFAULT_AGG_TERM_SIZE,
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
        fetchProjectsFulfilledAction({
          ...project,
          _constrainedBy: schemas,
          '@type': types,
        })
      );
    } catch (e) {
      return dispatch(fetchProjectsFailedAction(e));
    }
  };
};
