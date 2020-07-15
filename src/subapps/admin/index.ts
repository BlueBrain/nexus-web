import OrgsListView from './views/OrgsListView';
import { SubApp } from '..';
import ProjectsView from '../../shared/views/ProjectsView';

const Admin: SubApp = () => {
  return {
    title: 'Admin',
    namespace: 'admin',
    routes: [
      {
        path: '/',
        exact: true,
        component: OrgsListView,
      },
      {
        path: '/:orgLabel',
        exact: true,
        component: ProjectsView,
      },
    ],
  };
};

export default Admin;
