import { RouteProps } from 'react-router-dom';

import OrgsView from './views/OrgsView';
import ProjectsView from './views/ProjectsView';
import ProjectView from './views/ProjectView';
import Login from './views/Login';
import ResourceView from './views/ResourceView';
import ElasticSearchQueryView from './views/ElasticSearchQueryView';
import SparqlQueryView from './views/SparqlQueryView';
import ACLsView from './views/ACLsView';
import UserView from './views/UserView';

type RoutePropsWithName = RouteProps & {
  name: string;
};

const routes: RoutePropsWithName[] = [
  {
    path: '/',
    exact: true,
    name: 'OrgsView',
    component: OrgsView,
  },
  {
    name: 'LoginView',
    path: '/login',
    component: Login,
  },
  {
    name: 'UserView',
    path: '/user',
    component: UserView,
  },
  {
    name: 'ProjectsView',
    path: '/:orgLabel',
    exact: true,
    component: ProjectsView,
  },
  {
    name: 'ProjectView',
    path: '/:orgLabel/:projectLabel',
    exact: true,
    component: ProjectView,
  },
  {
    name: 'ResourceView',
    path: '/:orgLabel/:projectLabel/resources/:resourceId',
    component: ResourceView,
  },
  {
    name: 'ElasticSearchQueryView',
    path: '/:orgLabel/:projectLabel/:viewId/_search',
    component: ElasticSearchQueryView,
  },
  {
    name: 'SparqlQueryView',
    path: '/:orgLabel/:projectLabel/:viewId/sparql',
    component: SparqlQueryView,
  },
  {
    name: 'ACLsView',
    path: '/:orgLabel/:projectLabel/_settings/acls',
    component: ACLsView,
  },
];

export default routes;
