import { Action, ActionCreator, Dispatch } from 'redux';
import { Project } from '@bbp/nexus-sdk';
import { ThunkAction } from '..';
import { CreateProjectPayload } from '@bbp/nexus-sdk/lib/Project/types';

//
// Action Types
//
interface ModifyProjectAction extends Action {
  type: '@@nexus/PROJECT_MODIFYING';
}
interface ModifyProjectSuccessAction extends Action {
  type: '@@nexus/PROJECT_MODIFYING_SUCCESS';
  project: Project;
}
interface ModifyProjectFailureAction extends Action {
  type: '@@nexus/PROJECT_MODIFYING_FAILURE';
}
export type ProjectActions =
  | ModifyProjectAction
  | ModifyProjectSuccessAction
  | ModifyProjectFailureAction;

//
// Action definitions
//
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

//
// Action implementations
//
export const createProject = () => {};
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
      return Promise.reject(dispatch(modifyProjectFailureAction(e.message)));
    }
  };
};
