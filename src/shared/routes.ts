import { RouteProps } from 'react-router-dom';
import Home from './views/Home';
import Sample from './views/Sample';
import Login from './views/Login';
import { fetchOrgs } from './store/actions/orgs';

interface RouteWithData extends RouteProps {
  loadData?(): void;
}
const routes: RouteWithData[] = [
  {
    path: '/',
    exact: true,
    component: Home,
    loadData: () => fetchOrgs(),
  },
  {
    path: '/login',
    component: Login,
  },
  {
    path: '/sample',
    component: Sample,
  },
];

export default routes;
