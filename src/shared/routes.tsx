import { RouteProps, match } from 'react-router-dom';
import OrgsView from './views/OrgsView';
import ProjectsView from './views/ProjectsView';
import Login from './views/Login';
import Project from './views/Project';
import ResourceView from './views/ResourceView';
import { fetchOrgs } from './store/actions/nexus/orgs';
import { fetchOrg } from './store/actions/nexus/activeOrg';
import ElasticSearchQueryView from './views/ElasticSearchQueryView';
import SparqlQueryView from './views/SparqlQueryView';
import ACLsView from './views/ACLsView';
import { fetchAndAssignProject } from './store/actions/nexus/projects';
import { fetchAndAssignResource } from './store/actions/nexus/resource';
import { ThunkAction } from './store';
import { RootState } from './store/reducers';
import UserView from './views/UserView';

export interface RouteWithData extends RouteProps {
  loadData?(state: RootState, match: match | null): ThunkAction;
}
const routes: RouteWithData[] = [
  {
    path: '/',
    exact: true,
    component: OrgsView,
    loadData: () => fetchOrgs(),
  },
  {
    path: '/login',
    component: Login,
  },
  {
    path: '/user',
    component: UserView,
  },
  {
    path: '/:org',
    exact: true,
    component: ProjectsView,
  },
  {
    path: '/:org/:project',
    exact: true,
    component: Project,
    loadData: (state, match) => async (dispatch, getState, state) => {
      await fetchOrg(match && match.params && (match.params as any)['org'])(
        dispatch,
        getState,
        state
      );
      await fetchAndAssignProject(
        match && match.params && (match.params as any)['org'],
        match && match.params && (match.params as any)['project']
      )(dispatch, getState, state);
    },
  },
  {
    path: '/:org/:project/resources/:resourceId',
    component: ResourceView,
  },
  {
    path: '/:org/:project/:viewId/_search',
    component: ElasticSearchQueryView,
  },
  {
    path: '/:org/:project/:viewId/sparql',
    component: SparqlQueryView,
  },
  {
    path: '/:org/:project/_settings/acls',
    component: ACLsView,
  },
];

export default routes;
