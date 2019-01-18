import { Action, ActionCreator, Dispatch } from 'redux';
import { Project } from '@bbp/nexus-sdk';
import { ThunkAction } from '..';
import { CreateProjectPayload } from '@bbp/nexus-sdk/lib/Project/types';

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

export type ProjectActions =
  | CreateProjectAction
  | CreateProjectSuccessAction
  | CreateProjectFailureAction
  | ModifyProjectAction
  | ModifyProjectSuccessAction
  | ModifyProjectFailureAction
  | DeprecateProjectAction
  | DeprecateProjectSuccessAction
  | DeprecateProjectFailureAction;

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
    dispatch(deprecateProject());
    try {
      await Project.deprecate(orgLabel, projectLabel, rev);
      return dispatch(deprecateProjectSuccessAction());
    } catch (e) {
      return Promise.reject(dispatch(deprecateProjectFailureAction(e)));
    }
  };
};
