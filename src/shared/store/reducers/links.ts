import {
  IncomingOutgoingLinks,
  LinksActions,
  LinksActionTypes,
} from '../actions/nexus/links';
import { PaginatedList } from '@bbp/nexus-sdk';
import { ResourceLink } from '@bbp/nexus-sdk/lib/Resource/types';
import { AnyAction } from 'redux';
import {
  FetchActionWithKey,
  FetchFulfilledActionWithKey,
  FetchFailedActionWithKey,
} from '../actions/utils';
import { FetchableState } from './utils';

export interface LinksState {
  incoming?: FetchableState<PaginatedList<ResourceLink>>;
  outgoing?: FetchableState<PaginatedList<ResourceLink>>;
}

export function linksReducer(
  state: LinksState = {},
  action: LinksActions | AnyAction
) {
  switch (action.type) {
    case LinksActionTypes.FETCHING:
      return {
        ...state,
        [(action as FetchActionWithKey<LinksActionTypes.FETCHING>).key]: {
          data: null,
          isFetching: true,
          error: null,
        },
      };
    case LinksActionTypes.FULFILLED:
      return {
        ...state,
        [(action as FetchFulfilledActionWithKey<
          LinksActionTypes.FULFILLED,
          PaginatedList<ResourceLink>
        >).key]: {
          data: (action as FetchFulfilledActionWithKey<
            LinksActionTypes.FULFILLED,
            PaginatedList<ResourceLink>
          >).payload,
          isFetching: false,
          error: null,
        },
      };
    case LinksActionTypes.FAILED:
      return {
        ...state,
        [(action as FetchFailedActionWithKey<LinksActionTypes.FULFILLED>)
          .key]: {
          data: null,
          isFetching: false,
          error: (action as FetchFailedActionWithKey<
            LinksActionTypes.FULFILLED
          >).error,
        },
      };
  }
  return state;
}
