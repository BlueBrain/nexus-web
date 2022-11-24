import { RouteProps } from 'react-router-dom';
import GlobalSearchView from '../subapps/search/views/GlobalSearchView';

const routes: RouteProps[] = [
  {
    path: '/',
    exact: true,
    component: GlobalSearchView,
  },
];

export default routes;
