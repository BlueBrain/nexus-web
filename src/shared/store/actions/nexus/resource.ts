import { ActionCreator, Dispatch } from 'redux';
import { Resource } from '@bbp/nexus-sdk-legacy';
import { ThunkAction } from '../..';
import { FetchAction, FetchFulfilledAction, FetchFailedAction } from '../utils';
import { ResourceGetFormat } from '@bbp/nexus-sdk-legacy/lib/Resource/types';
import { WILDCARD_SCHEMA_ID } from '@bbp/nexus-sdk-legacy/lib/Schema';
import { formatError, RequestError } from '../utils/errors';

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
    {
      resource: Resource;
    }
  >
> = (resource: Resource, links) => ({
  type: ResourceActionTypes.FULFILLED,
  payload: {
    resource,
  },
});

const fetchResourceFailedAction: ActionCreator<
  FetchFailedAction<ResourceActionTypes.FAILED>
> = (error: RequestError) => ({
  error,
  type: ResourceActionTypes.FAILED,
});

export type ResourceActions =
  | FetchAction<ResourceActionTypes.FETCHING>
  | FetchFulfilledAction<ResourceActionTypes.FULFILLED, { resource: Resource }>
  | FetchFailedAction<ResourceActionTypes.FAILED>;

export const fetchAndAssignResource: ActionCreator<ThunkAction> = (
  orgLabel: string,
  projectLabel: string,
  resourceId: string,
  expanded: boolean
) => {
  return async (
    dispatch: Dispatch<any>,
    getState,
    { nexus }
  ): Promise<
    | FetchFulfilledAction<
        ResourceActionTypes.FULFILLED,
        {
          resource: Resource;
        }
      >
    | FetchFailedAction<ResourceActionTypes.FAILED>
  > => {
    const Resource = nexus.Resource;
    dispatch(fetchResourceAction());
    try {
      const resource = await Resource.get(
        orgLabel,
        projectLabel,
        WILDCARD_SCHEMA_ID,
        resourceId,
        {
          expanded,
        }
      );
      return dispatch(fetchResourceFulfilledAction(resource));
    } catch (e) {
      return dispatch(fetchResourceFailedAction(formatError(e)));
    }
  };
};

export const deprecateResource: ActionCreator<ThunkAction> = (
  resource: Resource
) => {
  return async (
    dispatch: Dispatch<any>,
    getState,
    { nexus }
  ): Promise<
    | FetchFulfilledAction<
        ResourceActionTypes.FULFILLED,
        {
          resource: Resource;
        }
      >
    | FetchFailedAction<ResourceActionTypes.FAILED>
  > => {
    const Resource = nexus.Resource;
    dispatch(fetchResourceAction());
    try {
      const deprecatedResource = await Resource.deprecateSelf(
        resource.self,
        resource.rev,
        resource.orgLabel,
        resource.projectLabel
      );
      return dispatch(fetchResourceFulfilledAction(deprecatedResource));
    } catch (e) {
      return dispatch(fetchResourceFailedAction(formatError(e)));
    }
  };
};
