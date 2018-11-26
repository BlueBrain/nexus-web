import { Action, ActionCreator, Dispatch } from 'redux';
import { ThunkAction } from 'redux-thunk';
import Nexus, { Organization } from 'nexus-sdk';

export type Services = {
  nexus: Nexus;
};

//
// Action types
//
interface FetchOrgsAction extends Action {
  type: 'ORGS_FETCHING';
}
interface FetchOrgsActionSuccess extends Action {
  type: 'ORGS_FETCHING_SUCCESS';
  payload: Organization[];
}
interface FetchOrgsActionFailure extends Action {
  type: 'ORGS_FETCHING_FAILURE';
}

const fetchOrgsAction: ActionCreator<FetchOrgsAction> = () => ({
  type: 'ORGS_FETCHING',
});
const fetchOrgsSuccessAction: ActionCreator<FetchOrgsActionSuccess> = (
  orgs: Organization[]
) => ({
  type: 'ORGS_FETCHING_SUCCESS',
  payload: orgs,
});
const fetchOrgsFailureAction: ActionCreator<FetchOrgsActionFailure> = (
  error: any
) => ({
  error,
  type: 'ORGS_FETCHING_FAILURE',
});

const fetchOrgs: ActionCreator<
  ThunkAction<Promise<any>, object, Services, any>
> = () => {
  return async (
    dispatch: Dispatch<any>,
    getState,
    { nexus }
  ): Promise<FetchOrgsActionSuccess | FetchOrgsActionFailure> => {
    dispatch(fetchOrgsAction());
    try {
      const orgs: Organization[] = await nexus.listOrganizations();
      return dispatch(fetchOrgsSuccessAction(orgs));
    } catch (e) {
      return dispatch(fetchOrgsFailureAction(e));
    }
  };
};

export type OrgsActions =
  | FetchOrgsAction
  | FetchOrgsActionSuccess
  | FetchOrgsActionFailure;

export { fetchOrgs };
