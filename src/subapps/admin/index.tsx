import * as React from 'react';
import OrgsListView from './views/OrgsListView';
import { SubApp } from '..';
import ProjectsView from './views/ProjectsView';

const title = 'Admin';
const namespace = 'admin';

const adminSubappProps = {
  title,
  namespace,
};

export const AdminSubappContext = React.createContext<{
  title: string;
  namespace: string;
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
    title,
    namespace,
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
    ],
  };
};

export default Admin;
