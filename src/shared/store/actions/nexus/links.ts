import { ActionCreator, Dispatch } from 'redux';
import { Resource, PaginatedList, PaginationSettings } from '@bbp/nexus-sdk';
import { ThunkAction } from '../..';
import {
  FetchAction,
  FetchFulfilledAction,
  FetchFailedAction,
  FetchActionWithKey,
  FetchFailedActionWithKey,
  FetchFulfilledActionWithKey,
} from '../utils';
import { ResourceLink } from '@bbp/nexus-sdk/lib/Resource/types';
import { formatError, RequestError } from '../utils/errors';

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
> = (incomingOrOutgoing: 'incoming' | 'outgoing') => ({
  type: LinksActionTypes.FETCHING,
  key: incomingOrOutgoing,
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
> = (
  incomingOrOutgoing: 'incoming' | 'outgoing',
  links: PaginatedList<ResourceLink>
) => ({
  type: LinksActionTypes.FULFILLED,
  key: incomingOrOutgoing,
  payload: links,
});

const fetchResourceFailedAction: ActionCreator<
  FetchFailedAction<LinksActionTypes.FAILED>
> = (incomingOrOutgoing: 'incoming' | 'outgoing', error: RequestError) => ({
  error,
  key: incomingOrOutgoing,
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
  incomingOrOutgoing: 'incoming' | 'outgoing',
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
    dispatch(fetchLinksAction(incomingOrOutgoing));
    try {
      switch (incomingOrOutgoing) {
        case 'incoming':
          const incoming = await resource.getIncomingLinks(paginationSettings);
          return dispatch(
            fetchLinksFulfilledAction(incomingOrOutgoing, incoming)
          );
        case 'outgoing':
          const outgoing = await resource.getOutgoingLinks(paginationSettings);
          return dispatch(
            fetchLinksFulfilledAction(incomingOrOutgoing, outgoing)
          );
      }
      return dispatch(
        fetchResourceFailedAction(
          incomingOrOutgoing,
          new Error('Incorrect Fetch Links Action')
        )
      );
    } catch (e) {
      return dispatch(
        fetchResourceFailedAction(incomingOrOutgoing, formatError(e))
      );
    }
  };
};
