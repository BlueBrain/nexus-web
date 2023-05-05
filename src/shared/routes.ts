import { RouteProps } from 'react-router-dom';
import ResourceView from './views/ResourceView';
import UserPage from '../pages/UserPage/UserPage';
import ProjectsPage from '../pages/ProjectsPage/ProjectsPage';
import Home from '../pages/HomePage/HomePage';
import IdentityPage from '../pages/IdentityPage/IdentityPage';
import StudioRedirectView from './views/StudioRedirectView';
import MyDataView from './views/MyDataView';
import { RedirectAdmin } from '../subapps/admin';

type TRoutePropsExtended = RouteProps & { protected: boolean };

const routes: TRoutePropsExtended[] = [
  {
    path: '/',
    exact: true,
    component: Home,
    protected: true,
  },
  {
    path: '/login',
    component: IdentityPage,
    exact: true,
    protected: false,
  },
  {
    path: '/user',
    component: UserPage,
    exact: true,
    protected: true,
  },
  {
    path: '/projects',
    component: ProjectsPage,
    exact: true,
    protected: true,
  },
  {
    path: '/my-data',
    component: MyDataView,
    exact: true,
    protected: true,
  },
  {
    path: '/:orgLabel/:projectLabel/resources/:resourceId',
    component: ResourceView,
    exact: true,
    protected: true,
  },
  {
    path: '/:orgLabel/:projectLabel/studios/:studioId',
    exact: true,
    component: StudioRedirectView,
    protected: false,
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
