import { ActionCreator, Dispatch } from 'redux';
import { Project, Resource, PaginatedList } from '@bbp/nexus-sdk';
import { ThunkAction } from '../..';
import { FetchAction, FetchFulfilledAction, FetchFailedAction } from '../utils';
import {
  ResourceGetFormat,
  ResourceLink,
} from '@bbp/nexus-sdk/lib/Resource/types';
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
      dotGraph: string;
      links: {
        incoming: PaginatedList<ResourceLink>;
      };
    }
  >
> = (resource: Resource, dotGraph: string, links) => ({
  type: ResourceActionTypes.FULFILLED,
  payload: {
    resource,
    dotGraph,
    links,
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
        {
          resource: Resource;
          dotGraph: string;
          links: {
            incoming: PaginatedList<ResourceLink>;
            // outgoing: PaginatedList<ResourceLink>;
          };
        }
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
      const incoming = await resource.getIncomingLinks({ from: 0, size: 20 });
      const links = {
        incoming,
      };
      return dispatch(fetchResourceFulfilledAction(resource, dotGraph, links));
    } catch (e) {
      return dispatch(fetchResourceFailedAction(formatError(e)));
    }
  };
};
