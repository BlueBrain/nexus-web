import { RouteProps } from 'react-router-dom';
import Landing from './views/Landing';
import Home from './views/Home';
import Login from './views/Login';
import { fetchOrgs } from './store/actions/orgs';

interface RouteWithData extends RouteProps {
  loadData?(): void;
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
    path: '/:owner',
    component: Home,
  },
];

export default routes;
