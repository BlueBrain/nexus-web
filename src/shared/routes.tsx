import * as React from 'react';
import { RouteProps, match } from 'react-router-dom';
import Landing from './views/Landing';
import Home from './views/Home';
import Login from './views/Login';
import Project from './views/Project';
import { fetchOrgs } from './store/actions/nexus/orgs';
import { fetchOrg } from './store/actions/nexus/activeOrg';
import { RawElasticSearchQuery, RawSparqlQuery } from './views/RawQuery';
import { fetchAndAssignProject } from './store/actions/nexus/projects';
import { ThunkAction } from './store';
import { RootState } from './store/reducers';
import { fetchAcls } from './store/actions/auth';

export interface RouteWithData extends RouteProps {
  loadData?(state: RootState, match: match | null): ThunkAction;
}
const routes: RouteWithData[] = [
  {
    path: '/',
    exact: true,
    component: Landing,
    loadData: () => fetchOrgs(),
  },
  {
    path: '/login',
    component: Login,
  },
  {
    path: '/:org',
    exact: true,
    component: Home,
    loadData: (state, match) =>
      fetchOrg(match && match.params && (match.params as any)['org']),
  },
  {
    path: '/:org/:project',
    exact: true,
    component: Project,
    loadData: (state, match) => async (dispatch, getState, state) => {
      const org = match && match.params && (match.params as any)['org'];
      const project = match && match.params && (match.params as any)['project'];

      await fetchOrg(org)(dispatch, getState, state);
      await fetchAcls(`/${org}/${project}`, { ancestors: true });
      await fetchAndAssignProject(org, project)(dispatch, getState, state);
    },
  },
  {
    path: '/:org/:project/_search',
    component: RawElasticSearchQuery,
  },
  {
    path: '/:org/:project/:view/_search',
    component: RawElasticSearchQuery,
  },
  {
    path: '/:org/:project/graph/sparql',
    component: RawSparqlQuery,
  },
];

export default routes;
