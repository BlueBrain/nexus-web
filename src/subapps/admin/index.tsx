import * as React from 'react';
import OrgsListView from './views/OrganizationsListPage/OrganizationListPage';
import OrgProjectsView from './views/OrganizationProjectsPage/OrganizationProjectsPage';
import ProjectView from './views/ProjectPage/ProjectPage';
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
const organisationSubappProps = {
  subAppType: 'internal',
  title: 'Organizations',
  namespace: 'orgs',
  icon: require('../../shared/images/dbIcon.svg'),
  requireLogin: true,
  description: 'Browse through different  group of datasets gather by those providing datas',
}
export const AdminSubappContext = React.createContext<{
  title: string;
  namespace: string;
  icon: string;
  requireLogin: boolean;
  description: string;
}>(adminSubappProps);
export const useAdminSubappContext = () => React.useContext(AdminSubappContext);
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
        component: AdminSubappProviderHOC(OrgProjectsView),
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

// -----

export const OrganisationsSubappContext = React.createContext<{
  title: string;
  namespace: string;
  icon: string;
  requireLogin: boolean;
  description: string;
}>(organisationSubappProps);
export const useOrganisationsSubappContext = () => React.useContext(OrganisationsSubappContext);

export const OrganizationsSubappProviderHOC = (component: React.FunctionComponent) => {
  return () => (
    <OrganisationsSubappContext.Provider value={organisationSubappProps}>
      {component({})}
    </OrganisationsSubappContext.Provider>
  );
};
export const Organizations: SubApp = () => {
  return ({
    subAppType: 'internal',
    title: 'Organizations',
    namespace: 'orgs',
    icon: require('../../shared/images/dbIcon.svg'),
    requireLogin: true,
    description: 'Browse through different  group of datasets gather by those providing datas',
    routes: [{
      path: '/',
      exact: true,
      component: OrganizationsSubappProviderHOC(OrgsListView),
    }, {
      path: '/:orgLabel',
      exact: true,
      component: OrganizationsSubappProviderHOC(OrgProjectsView),
    }, {
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
    },]
  })
}

export default Admin;
