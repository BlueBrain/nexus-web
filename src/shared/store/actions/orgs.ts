import { Action, ActionCreator, Dispatch } from 'redux';
import { Organization } from '@bbp/nexus-sdk';
import { ThunkAction } from '..';

//
// Action Types
//
interface CreateOrgAction extends Action {
  type: '@@nexus/ORG_CREATING';
}
interface CreateOrgSuccessAction extends Action {
  type: '@@nexus/ORG_CREATING_SUCCESS';
  org: Organization;
}
interface CreateOrgFailureAction extends Action {
  type: '@@nexus/ORG_CREATING_FAILURE';
  error: Error;
}

interface ModifyOrgAction extends Action {
  type: '@@nexus/ORG_MODIFYING';
}
interface ModifyOrgSuccessAction extends Action {
  type: '@@nexus/ORG_MODIFYING_SUCCESS';
  org: Organization;
}
interface ModifyOrgFailureAction extends Action {
  type: '@@nexus/ORG_MODIFYING_FAILURE';
  error: Error;
}

interface DeprecateOrgAction extends Action {
  type: '@@nexus/ORG_DEPRECATING';
}
interface DeprecateOrgSuccessAction extends Action {
  type: '@@nexus/ORG_DEPRECATING_SUCCESS';
}
interface DeprecateOrgFailureAction extends Action {
  type: '@@nexus/ORG_DEPRECATING_FAILURE';
  error: Error;
}

export type OrgActions =
  | CreateOrgAction
  | CreateOrgSuccessAction
  | CreateOrgFailureAction
  | ModifyOrgAction
  | ModifyOrgSuccessAction
  | ModifyOrgFailureAction
  | DeprecateOrgAction
  | DeprecateOrgSuccessAction
  | DeprecateOrgFailureAction;

//
// Action definitions
//
const createOrgAction: ActionCreator<CreateOrgAction> = () => ({
  type: '@@nexus/ORG_CREATING',
});
const createOrgSuccessAction: ActionCreator<CreateOrgSuccessAction> = (
  org: Organization
) => ({
  org,
  type: '@@nexus/ORG_CREATING_SUCCESS',
});
const createOrgFailureAction: ActionCreator<CreateOrgFailureAction> = (
  error: any
) => ({
  error,
  type: '@@nexus/ORG_CREATING_FAILURE',
});

const modifyOrgAction: ActionCreator<ModifyOrgAction> = () => ({
  type: '@@nexus/ORG_MODIFYING',
});
const modifyOrgSuccessAction: ActionCreator<ModifyOrgSuccessAction> = (
  org: Organization
) => ({
  org,
  type: '@@nexus/ORG_MODIFYING_SUCCESS',
});
const modifyOrgFailureAction: ActionCreator<ModifyOrgFailureAction> = (
  error: any
) => ({
  error,
  type: '@@nexus/ORG_MODIFYING_FAILURE',
});

const deprecateOrgAction: ActionCreator<DeprecateOrgAction> = () => ({
  type: '@@nexus/ORG_DEPRECATING',
});
const deprecateOrgSuccessAction: ActionCreator<
  DeprecateOrgSuccessAction
> = () => ({
  type: '@@nexus/ORG_DEPRECATING_SUCCESS',
});
const deprecateOrgFailureAction: ActionCreator<DeprecateOrgFailureAction> = (
  error: any
) => ({
  error,
  type: '@@nexus/ORG_DEPRECATING_FAILURE',
});

//
// Action implementations
//
export const createOrg: ActionCreator<ThunkAction> = (
  orgLabel: string,
) => {
  return async (
    dispatch: Dispatch<any>,
    getState,
    { nexus }
  ): Promise<CreateOrgSuccessAction | CreateOrgFailureAction> => {
    dispatch(createOrgAction());
    try {
      const org: Organization = await Organization.create(orgLabel);
      return dispatch(createOrgSuccessAction(org));
    } catch (e) {
      return Promise.reject(dispatch(createOrgFailureAction(e)));
    }
  };
};

export const modifyOrg: ActionCreator<ThunkAction> = (
  orgLabel: string,
  rev: number,
) => {
  return async (
    dispatch: Dispatch<any>,
    getState,
    { nexus }
  ): Promise<ModifyOrgSuccessAction | ModifyOrgFailureAction> => {
    dispatch(modifyOrgAction());
    try {
      const org: Organization = await Organization.update(
        orgLabel,
        rev,
      );
      return dispatch(modifyOrgSuccessAction(org));
    } catch (e) {
      return Promise.reject(dispatch(modifyOrgFailureAction(e)));
    }
  };
};

export const deprecateOrg: ActionCreator<ThunkAction> = (
  orgLabel: string,
  rev: number
) => {
  return async (
    dispatch: Dispatch<any>,
    getState,
    { nexus }
  ): Promise<DeprecateOrgSuccessAction | DeprecateOrgFailureAction> => {
    dispatch(deprecateOrgAction());
    try {
      await Organization.deprecate(orgLabel, rev);
      return dispatch(deprecateOrgSuccessAction());
    } catch (e) {
      return Promise.reject(dispatch(deprecateOrgFailureAction(e)));
    }
  };
};
