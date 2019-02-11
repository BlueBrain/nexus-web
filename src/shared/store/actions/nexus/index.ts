import { Action, ActionCreator, Dispatch } from 'redux';
import { Organization, Project, PaginatedList } from '@bbp/nexus-sdk';
import { ThunkAction } from '../..';

//
// Action types
//
interface FetchProjectsAction extends Action {
  type: '@@nexus/PROJECTS_FETCHING';
}
interface FetchProjectsActionSuccess extends Action {
  type: '@@nexus/PROJECTS_FETCHING_SUCCESS';
  payload: {
    org: Organization;
    projects: Project[];
  };
}
interface FetchProjectsActionFailure extends Action {
  type: '@@nexus/PROJECTS_FETCHING_FAILURE';
}

const fetchProjectsAction: ActionCreator<FetchProjectsAction> = () => ({
  type: '@@nexus/PROJECTS_FETCHING',
});
const fetchProjectsSuccessAction: ActionCreator<FetchProjectsActionSuccess> = (
  org: Organization,
  projects: Project[]
) => ({
  type: '@@nexus/PROJECTS_FETCHING_SUCCESS',
  payload: { org, projects },
});
const fetchProjectsFailureAction: ActionCreator<FetchProjectsActionFailure> = (
  error: any
) => ({
  error,
  type: '@@nexus/PROJECTS_FETCHING_FAILURE',
});

export const fetchProjects: ActionCreator<ThunkAction> = (name: string) => {
  return async (
    dispatch: Dispatch<any>,
    getState,
    { nexus }
  ): Promise<FetchProjectsActionSuccess | FetchProjectsActionFailure> => {
    dispatch(fetchProjectsAction());
    try {
      const org: Organization = await nexus.getOrganization(name);
      const projects: PaginatedList<Project> = await org.listProjects();
      return dispatch(fetchProjectsSuccessAction(org, projects.results));
    } catch (e) {
      return dispatch(fetchProjectsFailureAction(e));
    }
  };
};
