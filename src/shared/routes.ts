import { RouteProps } from 'react-router-dom';

import DataExplorerGraphFlowPage from '../pages/DataExplorerGraphFlowPage/DataExplorerGraphFlowPage';
import DataExplorerPage from '../pages/DataExplorerPage/DataExplorerPage';
import Home from '../pages/HomePage/HomePage';
import IdentityPage from '../pages/IdentityPage/IdentityPage';
import IDResolveRedirectionPage from '../pages/IDResolutionPage/IDResolveRedirectionPage';
import MyDataPage from '../pages/MyDataPage/MyDataPage';
import ProjectsPage from '../pages/ProjectsPage/ProjectsPage';
import UserPage from '../pages/UserPage/UserPage';
import ResourceView from './views/ResourceView';
import StudioRedirectView from './views/StudioRedirectView';

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
    path: '/resolve/:resourceId',
    component: IDResolveRedirectionPage,
    exact: true,
    protected: true,
  },
  {
    path: '/my-data',
    component: MyDataPage,
    exact: true,
    protected: true,
  },
  {
    path: '/data-explorer/graph-flow',
    component: DataExplorerGraphFlowPage,
    exact: true,
    protected: true,
  },
  {
    path: '/data-explorer',
    component: DataExplorerPage,
    exact: true,
    protected: true,
  },
  {
    path: 'client_silent_refresh',
    exact: true,
    component: () => null,
    protected: false,
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
