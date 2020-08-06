import * as React from 'react';
import OrgsListView from './views/OrgsListView';
import { SubApp } from '..';
import ProjectsView from './views/ProjectsView';
import ProjectView from './views/ProjectView';
import ElasticSearchQueryView from './views/ElasticSearchQueryView';
import SparqlQueryView from './views/SparqlQueryView';
import ACLsView from './views/ACLsView';

const title = 'Admin';
const namespace = 'admin';
const icon = require('../../shared/images/dbIcon.svg');

const adminSubappProps = {
  title,
  namespace,
  icon,
};

export const AdminSubappContext = React.createContext<{
  title: string;
  namespace: string;
  icon: string;
}>(adminSubappProps);

export function useAdminSubappContext() {
  const adminSubappProps = React.useContext(AdminSubappContext);

  return adminSubappProps;
}

export const AdminSubappProviderHOC = (component: React.FunctionComponent) => {
  return () => (
    <AdminSubappContext.Provider value={adminSubappProps}>
      {component({})}
    </AdminSubappContext.Provider>
  );
};

const Admin: SubApp = () => {
  return {
    ...adminSubappProps,
    routes: [
      {
        path: '/',
        exact: true,
        component: AdminSubappProviderHOC(OrgsListView),
      },
      {
        path: '/:orgLabel',
        exact: true,
        component: AdminSubappProviderHOC(ProjectsView),
      },
      {
        path: '/:orgLabel/:projectLabel',
        exact: true,
        component: AdminSubappProviderHOC(ProjectView),
      },
      {
        path: '/:orgLabel/:projectLabel/:viewId/_search',
        component: AdminSubappProviderHOC(ElasticSearchQueryView),
      },
      {
        path: '/:orgLabel/:projectLabel/:viewId/sparql',
        component: AdminSubappProviderHOC(SparqlQueryView),
      },
      {
        path: '/:orgLabel/:projectLabel/_settings/acls',
        component: AdminSubappProviderHOC(ACLsView),
      },
    ],
  };
};

export default Admin;
