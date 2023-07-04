import * as React from 'react';
import { Redirect, useLocation, useRouteMatch } from 'react-router';
import { get } from 'lodash';

import OrganizationListPage from '../../pages/OrganizationsListPage/OrganizationListPage';
import OrganizationProjectsPage from '../../pages/OrganizationProjectsPage/OrganizationProjectsPage';
import ProjectView from '../../pages/ProjectPage/ProjectPage';
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
  description:
    'Browse through different  group of datasets gather by those providing datas',
};
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

export const RedirectAdmin: React.FunctionComponent = props => {
  const location = useLocation();
  const route = useRouteMatch();
  return (
    <Redirect
      to={{
        pathname: `/orgs/${get(route.params, '0')}`,
        search: location.search,
      }}
    />
  );
};

export const OrganisationsSubappContext = React.createContext<{
  title: string;
  namespace: string;
  icon: string;
  requireLogin: boolean;
  description: string;
}>(organisationSubappProps);
export const useOrganisationsSubappContext = () =>
  React.useContext(OrganisationsSubappContext);

export const OrganizationsSubappProviderHOC = (
  component: React.FunctionComponent
) => {
  return () => (
    <OrganisationsSubappContext.Provider value={organisationSubappProps}>
      {component({})}
    </OrganisationsSubappContext.Provider>
  );
};
export const Organizations: SubApp = () => {
  return {
    subAppType: 'internal',
    title: 'Organizations',
    namespace: 'orgs',
    icon: require('../../shared/images/dbIcon.svg'),
    requireLogin: true,
    description:
      'Browse through different  group of datasets gather by those providing datas',
    routes: [
      {
        path: '/',
        exact: true,
        component: OrganizationsSubappProviderHOC(OrganizationListPage),
        protected: true,
      },
      {
        path: '/:orgLabel',
        exact: true,
        component: OrganizationsSubappProviderHOC(OrganizationProjectsPage),
        protected: true,
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
        protected: true,
      },
    ],
  };
};

// export default Admin;
