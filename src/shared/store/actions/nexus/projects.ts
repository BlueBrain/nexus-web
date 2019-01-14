import { Action, ActionCreator, Dispatch } from 'redux';
import { Project } from '@bbp/nexus-sdk';
import { ThunkAction } from '../..';

enum ProjectActionTypes {
  FETCHING = '@@nexus/PROJECT_FETCHING',
  FULFILLED = '@@nexus/PROJECT_FETHCING_FULFILLED',
  FAILED = '@@nexus/PROJECT_FETCHING_FAILED',
}

export const actionTypes = {
  FETCHING: ProjectActionTypes.FETCHING,
  FULFILLED: ProjectActionTypes.FULFILLED,
  FAILED: ProjectActionTypes.FAILED,
};

interface FetchProjectAction extends Action {
  type: ProjectActionTypes.FETCHING;
}

interface FetchProjectActionFulfilled extends Action {
  type: ProjectActionTypes.FULFILLED;
  payload: Project;
}

interface FetchProjectActionFailed extends Action {
  type: ProjectActionTypes.FAILED;
  error: Error;
}

const fetchProjectsAction: ActionCreator<FetchProjectAction> = () => ({
  type: ProjectActionTypes.FETCHING,
});

const fetchProjectsFulfilledAction: ActionCreator<
  FetchProjectActionFulfilled
> = (project: Project) => ({
  type: ProjectActionTypes.FULFILLED,
  payload: project,
});

const fetchProjectsFailedAction: ActionCreator<FetchProjectActionFailed> = (
  error: Error
) => ({
  error,
  type: ProjectActionTypes.FAILED,
});

export const fetchAndAssignProject: ActionCreator<ThunkAction> = (
  orgLabel: string,
  projectLabel: string
) => {
  return async (
    dispatch: Dispatch<any>
  ): Promise<FetchProjectActionFulfilled | FetchProjectActionFailed> => {
    dispatch(fetchProjectsAction());
    try {
      const project: Project = await Project.get(orgLabel, projectLabel);
      return dispatch(fetchProjectsFulfilledAction(project));
    } catch (e) {
      return dispatch(fetchProjectsFailedAction(e));
    }
  };
};
