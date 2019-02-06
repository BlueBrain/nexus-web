import { ActionCreator, Dispatch } from 'redux';
import { Project, Resource } from '@bbp/nexus-sdk';
import { ThunkAction } from '../..';
import { FetchAction, FetchFulfilledAction, FetchFailedAction } from '../utils';

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
  FetchFulfilledAction<ResourceActionTypes.FULFILLED, Resource>
> = (resource: Resource) => ({
  type: ResourceActionTypes.FULFILLED,
  payload: resource,
});

const fetchResourceFailedAction: ActionCreator<
  FetchFailedAction<ResourceActionTypes.FAILED>
> = (error: Error) => ({
  error,
  type: ResourceActionTypes.FAILED,
});

export type ResourceActions =
  | FetchAction<ResourceActionTypes.FETCHING>
  | FetchFulfilledAction<ResourceActionTypes.FULFILLED, Resource>
  | FetchFailedAction<ResourceActionTypes.FAILED>;

export const fetchAndAssignResource: ActionCreator<ThunkAction> = (
  orgLabel: string,
  projectLabel: string,
  resourceId: string
) => {
  return async (
    dispatch: Dispatch<any>
  ): Promise<
    | FetchFulfilledAction<ResourceActionTypes.FULFILLED, Resource>
    | FetchFailedAction<ResourceActionTypes.FAILED>
  > => {
    dispatch(fetchResourceAction());
    try {
      const project: Project = await Project.get(orgLabel, projectLabel);
      console.log({ resourceId });
      const resource = await project.getResource(resourceId);
      return dispatch(fetchResourceFulfilledAction(resource));
    } catch (e) {
      console.error(e);
      return dispatch(fetchResourceFailedAction(e));
    }
  };
};
