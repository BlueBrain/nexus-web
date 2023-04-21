import { RouteProps } from 'react-router-dom';
import Login from './views/Login';
import ResourceView from './views/ResourceView';
import UserPage from '../pages/UserPage/UserPage';
import ProjectsPage from '../pages/ProjectsPage/ProjectsPage';
import Home from '../pages/HomePage/HomePage';
import StudioRedirectView from './views/StudioRedirectView';
import MyDataView from './views/MyDataView';

type TRoutePropsExtended = RouteProps & { protected: boolean };
const routes: TRoutePropsExtended[] = [
  {
    path: '/',
    exact: true,
    component: Home,
    protected: false,
  },
  {
    path: '/login',
    component: Login,
    protected: false,
  },
  {
    path: '/user',
    component: UserPage,
    protected: true,
  },
  {
    path: '/projects',
    component: ProjectsPage,
    protected: true,
  },
  {
    path: '/my-data',
    component: MyDataView,
    protected: true,
  },
  {
    path: '/:orgLabel/:projectLabel/resources/:resourceId',
    component: ResourceView,
    protected: true,
  },
  {
    path: '/:orgLabel/:projectLabel/studios/:studioId',
    exact: true,
    component: StudioRedirectView,
    protected: true,
  },
  {
    path: '/:orgLabel/:projectLabel/studios/:studioId/workspaces/:workspaceId',
    exact: true,
    component: StudioRedirectView,
    protected: true,
  },
  {
    path:
      '/:orgLabel/:projectLabel/studios/:studioId/workspaces/:workspaceId/dashboards/:dashboardId',
    exact: true,
    component: StudioRedirectView,
    protected: true,
  },
  {
    path:
      '/:orgLabel/:projectLabel/studios/:studioId/workspaces/:workspaceId/dashboards/:dashboardId/studioResource/:studioResourceId',
    exact: true,
    component: StudioRedirectView,
    protected: true,
  },
];

export default routes;
