import { RouteProps, match } from 'react-router-dom';
import Landing from './views/Landing';
import Home from './views/Home';
import Login from './views/Login';
import Project from './views/Project';
import {
  fetchOrgs,
  fetchProjects,
  fetchResources,
} from './store/actions/nexus';
import { ThunkAction } from './store';
import { RootState } from './store/reducers';

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
      fetchProjects(match && match.params && (match.params as any)['org']),
  },
  {
    path: '/:org/:project',
    exact: true,
    component: Project,
    loadData: (state, match) =>
      fetchResources(
        match && match.params && (match.params as any)['org'],
        match && match.params && (match.params as any)['project']
      ),
  },
];

export default routes;
