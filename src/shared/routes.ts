import { RouteProps } from 'react-router';
import Home from './views/Home';
import Sample from './views/Sample';

const routes: RouteProps[] = [
  {
    path: '/',
    exact: true,
    component: Home,
  },
  {
    path: '/sample',
    component: Sample,
  },
];

export default routes;
