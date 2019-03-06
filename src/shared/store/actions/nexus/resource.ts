import { ActionCreator, Dispatch } from 'redux';
import { Project, Resource } from '@bbp/nexus-sdk';
import { ThunkAction } from '../..';
import { FetchAction, FetchFulfilledAction, FetchFailedAction } from '../utils';
import { ResourceGetFormat } from '@bbp/nexus-sdk/lib/Resource/types';
import { formatError, RequestErrors } from '../utils/errors';

enum ResourceActionTypes {
  FETCHING = '@@nexus/RESOURCE_FETCHING',
  FULFILLED = '@@nexus/RESOURCE_FETHCING_FULFILLED',
  FAILED = '@@nexus/RESOURCE_FETCHING_FAILED',
}

export const actionTypes = {
  FETCHING: ResourceActionTypes.FETCHING,
  FULFILLED: ResourceActionTypes.FULFILLED,
  FAILED: ResourceActionTypes.FAILED,
};

const fetchResourceAction: ActionCreator<
  FetchAction<ResourceActionTypes.FETCHING>
> = () => ({
  type: ResourceActionTypes.FETCHING,
});

const fetchResourceFulfilledAction: ActionCreator<
  FetchFulfilledAction<
    ResourceActionTypes.FULFILLED,
    { resource: Resource; dotGraph: string }
  >
> = (resource: Resource, dotGraph: string) => ({
  type: ResourceActionTypes.FULFILLED,
  payload: {
    resource,
    dotGraph,
  },
});

const fetchResourceFailedAction: ActionCreator<
  FetchFailedAction<ResourceActionTypes.FAILED>
> = (error: RequestErrors) => ({
  error,
  type: ResourceActionTypes.FAILED,
});

export type ResourceActions =
  | FetchAction<ResourceActionTypes.FETCHING>
  | FetchFulfilledAction<
      ResourceActionTypes.FULFILLED,
      { resource: Resource; dotGraph: string }
    >
  | FetchFailedAction<ResourceActionTypes.FAILED>;

export const fetchAndAssignResource: ActionCreator<ThunkAction> = (
  orgLabel: string,
  projectLabel: string,
  resourceId: string
) => {
  return async (
    dispatch: Dispatch<any>
  ): Promise<
    | FetchFulfilledAction<
        ResourceActionTypes.FULFILLED,
        { resource: Resource; dotGraph: string }
      >
    | FetchFailedAction<ResourceActionTypes.FAILED>
  > => {
    dispatch(fetchResourceAction());
    try {
      const project: Project = await Project.get(orgLabel, projectLabel);
      const resource = await project.getResource(resourceId);
      const dotGraph = await Resource.getSelfRawAs(
        resource.self,
        ResourceGetFormat.DOT
      );
      return dispatch(fetchResourceFulfilledAction(resource, dotGraph));
    } catch (e) {
      return dispatch(fetchResourceFailedAction(formatError(e)));
    }
  };
};
