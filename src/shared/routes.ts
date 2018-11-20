import { RouteProps } from 'react-router-dom';
import Home from './views/Home';
import Sample from './views/Sample';
import Login from './views/Login';

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
    path: '/sample',
    component: Sample,
  },
];

export default routes;
