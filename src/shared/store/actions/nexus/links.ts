import { ActionCreator, Dispatch } from 'redux';
import { Resource, PaginatedList, PaginationSettings } from '@bbp/nexus-sdk-legacy';
import { ThunkAction } from '../..';
import {
  FetchAction,
  FetchFulfilledAction,
  FetchFailedAction,
  FetchActionWithKey,
  FetchFailedActionWithKey,
  FetchFulfilledActionWithKey,
} from '../utils';
import { ResourceLink } from '@bbp/nexus-sdk-legacy/lib/Resource/types';
import { formatError, RequestError } from '../utils/errors';

export enum LinkDirection {
  INCOMING = 'incoming',
  OUTGOING = 'outgoing',
}

export enum LinksActionTypes {
  FETCHING = '@@nexus/LINKS_FETCHING',
  FULFILLED = '@@nexus/LINKS_FETCHING_FULFILLED',
  FAILED = '@@nexus/LINKS_FETCHING_FAILED',
}

export const actionTypes = {
  FETCHING: LinksActionTypes.FETCHING,
  FULFILLED: LinksActionTypes.FULFILLED,
  FAILED: LinksActionTypes.FAILED,
};

const fetchLinksAction: ActionCreator<
  FetchActionWithKey<LinksActionTypes.FETCHING>
> = (linkDirection: LinkDirection) => ({
  type: LinksActionTypes.FETCHING,
  key: linkDirection,
});

export interface IncomingOutgoingLinks {
  incoming: PaginatedList<ResourceLink>;
  outgoing: PaginatedList<ResourceLink>;
}

const fetchLinksFulfilledAction: ActionCreator<
  FetchFulfilledActionWithKey<
    LinksActionTypes.FULFILLED,
    PaginatedList<ResourceLink>
  >
> = (linkDirection: LinkDirection, links: PaginatedList<ResourceLink>) => ({
  type: LinksActionTypes.FULFILLED,
  key: linkDirection,
  payload: links,
});

const fetchResourceFailedAction: ActionCreator<
  FetchFailedAction<LinksActionTypes.FAILED>
> = (linkDirection: LinkDirection, error: RequestError) => ({
  error,
  key: linkDirection,
  type: LinksActionTypes.FAILED,
});

export type LinksActions =
  | FetchAction<LinksActionTypes.FETCHING>
  | FetchFulfilledAction<
      LinksActionTypes.FULFILLED,
      PaginatedList<ResourceLink>
    >
  | FetchFailedAction<LinksActionTypes.FAILED>;

export const fetchLinks: ActionCreator<ThunkAction> = (
  resource: Resource,
  linkDirection: LinkDirection,
  paginationSettings: PaginationSettings
) => {
  return async (
    dispatch: Dispatch<any>
  ): Promise<
    | FetchFulfilledAction<
        LinksActionTypes.FULFILLED,
        PaginatedList<ResourceLink>
      >
    | FetchFailedAction<LinksActionTypes.FAILED>
  > => {
    dispatch(fetchLinksAction(linkDirection));
    try {
      switch (linkDirection) {
        case LinkDirection.INCOMING:
          const incoming = await resource.getIncomingLinks(paginationSettings);
          return dispatch(fetchLinksFulfilledAction(linkDirection, incoming));
        case LinkDirection.OUTGOING:
          const outgoing = await resource.getOutgoingLinks(paginationSettings);
          return dispatch(fetchLinksFulfilledAction(linkDirection, outgoing));
      }
      return dispatch(
        fetchResourceFailedAction(
          linkDirection,
          new Error('Incorrect Fetch Links Action')
        )
      );
    } catch (e) {
      return dispatch(fetchResourceFailedAction(linkDirection, formatError(e)));
    }
  };
};
