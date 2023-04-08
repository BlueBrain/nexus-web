import { RouteProps } from 'react-router-dom';
import Login from './views/Login';
import ResourceView from './views/ResourceView';
import UserView from './views/UserView';
import ProjectsPage from '../pages/ProjectsPage/ProjectsPage';
import StudioRedirectView from './views/StudioRedirectView';
import Home from './views/Home';
import MyDataView from './views/MyDataView';

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
    path: '/projects',
    component: ProjectsPage,
  },
  {
    path: '/my-data',
    component: MyDataView,
  },
  {
    path: '/:orgLabel/:projectLabel/resources/:resourceId',
    component: ResourceView,
  },
  {
    path: '/:orgLabel/:projectLabel/studios/:studioId',
    exact: true,
    component: StudioRedirectView,
  },
  {
    path: '/:orgLabel/:projectLabel/studios/:studioId/workspaces/:workspaceId',
    exact: true,
    component: StudioRedirectView,
  },
  {
    path:
      '/:orgLabel/:projectLabel/studios/:studioId/workspaces/:workspaceId/dashboards/:dashboardId',
    exact: true,
    component: StudioRedirectView,
  },
  {
    path:
      '/:orgLabel/:projectLabel/studios/:studioId/workspaces/:workspaceId/dashboards/:dashboardId/studioResource/:studioResourceId',
    exact: true,
    component: StudioRedirectView,
  },
];

export default routes;
