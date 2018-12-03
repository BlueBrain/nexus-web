import { RouteProps, match } from 'react-router-dom';
import Landing from './views/Landing';
import Home from './views/Home';
import Login from './views/Login';
import { fetchOrgs, fetchOrg } from './store/actions/orgs';
import { ThunkAction } from './store';
import { RootState } from './store/reducers';
import Orgs from './views/Orgs';
import Resources from './views/Resources';

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
    path: '/resources',
    component: Resources,
  },
  {
    path: '/orgs',
    component: Orgs,
  },
  {
    path: '/login',
    component: Login,
  },
  {
    path: '/:org',
    component: Home,
    loadData: (state, match) =>
      fetchOrg(match && match.params && (match.params as any)['org']),
  },
];

export default routes;
