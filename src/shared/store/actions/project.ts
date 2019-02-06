import { Action, ActionCreator, Dispatch } from 'redux';
import { Project } from '@bbp/nexus-sdk';
import { ThunkAction } from '..';
import { CreateProjectPayload } from '@bbp/nexus-sdk/lib/Project/types';
import { httpGet, httpPut } from '@bbp/nexus-sdk/lib/utils/http';
import { IdentityResponse, Identity } from '@bbp/nexus-sdk/lib/ACL/types';

//
// Action Types
//
interface CreateProjectAction extends Action {
  type: '@@nexus/PROJECT_CREATING';
}
interface CreateProjectSuccessAction extends Action {
  type: '@@nexus/PROJECT_CREATING_SUCCESS';
  project: Project;
}
interface CreateProjectFailureAction extends Action {
  type: '@@nexus/PROJECT_CREATING_FAILURE';
  error: Error;
}

interface ModifyProjectAction extends Action {
  type: '@@nexus/PROJECT_MODIFYING';
}
interface ModifyProjectSuccessAction extends Action {
  type: '@@nexus/PROJECT_MODIFYING_SUCCESS';
  project: Project;
}
interface ModifyProjectFailureAction extends Action {
  type: '@@nexus/PROJECT_MODIFYING_FAILURE';
  error: Error;
}

interface DeprecateProjectAction extends Action {
  type: '@@nexus/PROJECT_DEPRECATING';
}
interface DeprecateProjectSuccessAction extends Action {
  type: '@@nexus/PROJECT_DEPRECATING_SUCCESS';
}
interface DeprecateProjectFailureAction extends Action {
  type: '@@nexus/PROJECT_DEPRECATING_FAILURE';
  error: Error;
}

interface MakeProjectPublicAction extends Action {
  type: '@@nexus/PROJECT_MAKING_PUBLIC';
}
interface MakeProjectPublicSuccessAction extends Action {
  type: '@@nexus/PROJECT_MAKING_PUBLIC_SUCCESS';
}
interface MakeProjectPublicFailureAction extends Action {
  type: '@@nexus/PROJECT_MAKING_PUBLIC_FAILURE';
  error: Error;
}

export type ProjectActions =
  | CreateProjectAction
  | CreateProjectSuccessAction
  | CreateProjectFailureAction
  | ModifyProjectAction
  | ModifyProjectSuccessAction
  | ModifyProjectFailureAction
  | DeprecateProjectAction
  | DeprecateProjectSuccessAction
  | DeprecateProjectFailureAction
  | MakeProjectPublicAction
  | MakeProjectPublicSuccessAction
  | MakeProjectPublicFailureAction;

//
// Action definitions
//
const createProjectAction: ActionCreator<CreateProjectAction> = () => ({
  type: '@@nexus/PROJECT_CREATING',
});
const createProjectSuccessAction: ActionCreator<CreateProjectSuccessAction> = (
  project: Project
) => ({
  project,
  type: '@@nexus/PROJECT_CREATING_SUCCESS',
});
const createProjectFailureAction: ActionCreator<CreateProjectFailureAction> = (
  error: any
) => ({
  error,
  type: '@@nexus/PROJECT_CREATING_FAILURE',
});

const modifyProjectAction: ActionCreator<ModifyProjectAction> = () => ({
  type: '@@nexus/PROJECT_MODIFYING',
});
const modifyProjectSuccessAction: ActionCreator<ModifyProjectSuccessAction> = (
  project: Project
) => ({
  project,
  type: '@@nexus/PROJECT_MODIFYING_SUCCESS',
});
const modifyProjectFailureAction: ActionCreator<ModifyProjectFailureAction> = (
  error: any
) => ({
  error,
  type: '@@nexus/PROJECT_MODIFYING_FAILURE',
});

const deprecateProjectAction: ActionCreator<DeprecateProjectAction> = () => ({
  type: '@@nexus/PROJECT_DEPRECATING',
});
const deprecateProjectSuccessAction: ActionCreator<
  DeprecateProjectSuccessAction
> = (project: Project) => ({
  type: '@@nexus/PROJECT_DEPRECATING_SUCCESS',
});
const deprecateProjectFailureAction: ActionCreator<
  DeprecateProjectFailureAction
> = (error: any) => ({
  error,
  type: '@@nexus/PROJECT_DEPRECATING_FAILURE',
});

const makeProjectPublicAction: ActionCreator<MakeProjectPublicAction> = () => ({
  type: '@@nexus/PROJECT_MAKING_PUBLIC',
});
const makeProjectPublicSuccessAction: ActionCreator<
  MakeProjectPublicSuccessAction
> = (project: Project) => ({
  type: '@@nexus/PROJECT_MAKING_PUBLIC_SUCCESS',
});
const makeProjectPublicFailureAction: ActionCreator<
  MakeProjectPublicFailureAction
> = (error: any) => ({
  error,
  type: '@@nexus/PROJECT_MAKING_PUBLIC_FAILURE',
});

//
// Action implementations
//
export const createProject: ActionCreator<ThunkAction> = (
  orgLabel: string,
  projectLabel: string,
  payload: CreateProjectPayload
) => {
  return async (
    dispatch: Dispatch<any>,
    getState,
    { nexus }
  ): Promise<CreateProjectSuccessAction | CreateProjectFailureAction> => {
    dispatch(createProjectAction());
    try {
      const project: Project = await Project.create(
        orgLabel,
        projectLabel,
        payload
      );
      return dispatch(createProjectSuccessAction(project));
    } catch (e) {
      return Promise.reject(dispatch(createProjectFailureAction(e)));
    }
  };
};
export const modifyProject: ActionCreator<ThunkAction> = (
  orgLabel: string,
  projectLabel: string,
  rev: number,
  payload: CreateProjectPayload
) => {
  return async (
    dispatch: Dispatch<any>,
    getState,
    { nexus }
  ): Promise<ModifyProjectSuccessAction | ModifyProjectFailureAction> => {
    dispatch(modifyProjectAction());
    try {
      const project: Project = await Project.update(
        orgLabel,
        projectLabel,
        rev,
        payload
      );
      return dispatch(modifyProjectSuccessAction(project));
    } catch (e) {
      return Promise.reject(dispatch(modifyProjectFailureAction(e)));
    }
  };
};

export const deprecateProject: ActionCreator<ThunkAction> = (
  orgLabel: string,
  projectLabel: string,
  rev: number
) => {
  return async (
    dispatch: Dispatch<any>,
    getState,
    { nexus }
  ): Promise<DeprecateProjectSuccessAction | DeprecateProjectFailureAction> => {
    dispatch(deprecateProjectAction());
    try {
      await Project.deprecate(orgLabel, projectLabel, rev);
      return dispatch(deprecateProjectSuccessAction());
    } catch (e) {
      return Promise.reject(dispatch(deprecateProjectFailureAction(e)));
    }
  };
};

export const makeProjectPublic: ActionCreator<ThunkAction> = (
  orgLabel: string,
  projectLabel: string
) => {
  return async (
    dispatch: Dispatch<any>,
    getState,
    { nexus }
  ): Promise<
    MakeProjectPublicSuccessAction | MakeProjectPublicFailureAction
  > => {
    dispatch(makeProjectPublicAction());
    try {
      // @ts-ignore
      const endpoint = getState().config.apiEndpoint;

      const publicPermissions = [
        'projects/read',
        'resources/read',
        'views/query',
      ];

      const getAnonymous = async (): Promise<IdentityResponse> => {
        try {
          const identitiesResponse = await httpGet(
            `${endpoint}/identities`,
            false
          );
          const anonymous = identitiesResponse.identities.find(
            (identity: Identity) => identity['@type'] === 'Anonymous'
          );
          if (!anonymous) {
            throw new Error(
              'Error: Cannot find the Anonymous user. It is needed for Nexus to work properly. There is a serious problem. Please notify an administator.'
            );
          }
          return anonymous;
        } catch (e) {
          throw e;
        }
      };
      const anonymous = await getAnonymous();

      const acls = await httpGet(
        `${endpoint}/acls/${orgLabel}/${projectLabel}`,
        false
      );

      const alreadyPublic = acls._results.some((result: any) => {
        return (
          result.acl &&
          result.acl.some((acl: any) => {
            return (
              acl.identity &&
              acl.identity['@type'] === 'Anonymous' &&
              acl.permissions &&
              publicPermissions.every((value: string) =>
                acl.permissions.includes(value)
              )
            );
          })
        );
      });

      if (alreadyPublic) {
        throw new Error('Project is already public');
      }

      const rev =
        acls._results[0] && acls._results[0]._rev ? acls._results[0]._rev : 1;

      const addACL = async (rev: number = 1) => {
        // We'll add the ACL on the entity itself,
        // even if an ancestor already gives the permission.
        // TODO: use PATCH method instead, once the CORS issue is fixed.
        try {
          await httpPut(
            `${endpoint}/acls/${orgLabel}/${projectLabel}?rev=${rev}`,
            {
              // "@type": "Append",
              acl: [
                {
                  permissions: publicPermissions,
                  identity: anonymous,
                },
              ],
            },
            false
          );
          return true;
        } catch (e) {
          console.log(e);
          return false;
        }
      };

      if (await addACL(rev)) {
        return dispatch(makeProjectPublicSuccessAction());
      }

      throw new Error('Could not make project public');
    } catch (e) {
      return Promise.reject(dispatch(makeProjectPublicFailureAction(e)));
    }
  };
};
