import { RouteProps } from 'react-router';
import Home from './views/Home';

const routes: RouteProps[] = [
  {
    path: '/',
    exact: true,
    component: Home,
  },
];

export default routes;