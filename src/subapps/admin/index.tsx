import * as React from 'react';
import OrgsListView from './views/OrgsListView';
import ProjectsView from './views/ProjectsView';
import ProjectView from './views/ProjectView';
import { SubApp } from '..';

const subAppType = 'internal';
const title = 'Admin';
const namespace = 'admin';
const icon = require('../../shared/images/dbIcon.svg');
const requireLogin = true;
const description = 'Manage, edit, and query your Nexus Delta knowledge graph';

const adminSubappProps = {
  subAppType,
  title,
  namespace,
  icon,
  requireLogin,
  description,
};

export const AdminSubappContext = React.createContext<{
  title: string;
  namespace: string;
  icon: string;
  requireLogin: boolean;
  description: string;
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
        path: [
          '/:orgLabel/:projectLabel',
          '/:orgLabel/:projectLabel/browse',
          '/:orgLabel/:projectLabel/query/:viewId?',
          '/:orgLabel/:projectLabel/create',
          '/:orgLabel/:projectLabel/statistics',
          '/:orgLabel/:projectLabel/settings',
          '/:orgLabel/:projectLabel/graph-analytics',
          '/:orgLabel/:projectLabel/jira',
        ],
        exact: true,
        component: AdminSubappProviderHOC(ProjectView),
      },
    ],
  };
};

export default Admin;
