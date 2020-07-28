import { RouteProps } from 'react-router-dom';
import Login from './views/Login';
import ResourceView from './views/ResourceView';
import UserView from './views/UserView';
import Home from './views/Home';

const routes: RouteProps[] = [
  {
    path: '/',
    exact: true,
    component: Home,
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
    path: '/:orgLabel/:projectLabel/resources/:resourceId',
    component: ResourceView,
  },
];

export default routes;
