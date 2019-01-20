import { ActionCreator, Dispatch } from 'redux';
import { Organization } from '@bbp/nexus-sdk';
import { ThunkAction } from '../..';
import { FetchAction, FetchFulfilledAciton, FetchFailedAction } from '../utils';

enum OrgsActionTypes {
  FETCHING = '@@nexus/ORGS_FETCHING',
  FULFILLED = '@@nexus/ORGS_FETCHING_FULFILLED',
  FAILED = '@@nexus/ORGS_FETCHING_FAILED',
}

export const actionTypes = {
  FETCHING: OrgsActionTypes.FETCHING,
  FULFILLED: OrgsActionTypes.FULFILLED,
  FAILED: OrgsActionTypes.FAILED,
};

const fetchOrgsAction: ActionCreator<
  FetchAction<OrgsActionTypes.FETCHING>
> = () => ({
  type: OrgsActionTypes.FETCHING,
});

const fetchOrgsFulfilledAction: ActionCreator<
  FetchFulfilledAciton<OrgsActionTypes.FULFILLED, Organization[]>
> = (orgs: Organization[]) => ({
  type: OrgsActionTypes.FULFILLED,
  payload: orgs,
});

const fetchOrgsFailedAction: ActionCreator<
  FetchFailedAction<OrgsActionTypes.FAILED>
> = (error: Error) => ({
  error,
  type: OrgsActionTypes.FAILED,
});

export const fetchOrgs: ActionCreator<ThunkAction> = () => {
  return async (
    dispatch: Dispatch<any>,
    getState,
    { nexus }
  ): Promise<
    | FetchFulfilledAciton<OrgsActionTypes.FULFILLED, Organization[]>
    | FetchFailedAction<OrgsActionTypes.FAILED>
  > => {
    dispatch(fetchOrgsAction());
    try {
      const orgs: Organization[] = await nexus.listOrganizations();
      return dispatch(fetchOrgsFulfilledAction(orgs));
    } catch (e) {
      return dispatch(fetchOrgsFailedAction(e));
    }
  };
};
