import * as React from 'react';
import { SubApp } from '..';
import StudioView from './views/StudioView';
import StudioListView from './views/StudioListView';

const title = 'StudioLegacy';
const namespace = 'studioLegacy';
const icon = require('../../shared/images/dbIcon.svg');

const studioLegacySubappProps = {
  title,
  namespace,
  icon,
};

export const StudioLegacySubappContext = React.createContext<{
  title: string;
  namespace: string;
  icon: string;
}>(studioLegacySubappProps);

export function useStudioLegacySubappContext() {
  const studioLegacySubappProps = React.useContext(StudioLegacySubappContext);
  return studioLegacySubappProps;
}

export const StudioLegacySubappProviderHOC = (
  component: React.FunctionComponent
) => {
  return () => (
    <StudioLegacySubappContext.Provider value={studioLegacySubappProps}>
      {component({})}
    </StudioLegacySubappContext.Provider>
  );
};

const StudioLegacy: SubApp = () => {
  return {
    ...studioLegacySubappProps,
    routes: [
      {
        path: '/',
        exact: true,
        component: StudioLegacySubappProviderHOC(StudioListView),
      },
      {
        path: '/:orgLabel/:projectLabel/studios/:studioId',
        exact: true,
        component: StudioLegacySubappProviderHOC(StudioView),
      },
      {
        path:
          '/:orgLabel/:projectLabel/studios/:studioId/workspaces/:workspaceId',
        exact: true,
        component: StudioLegacySubappProviderHOC(StudioView),
      },
      {
        path:
          '/:orgLabel/:projectLabel/studios/:studioId/workspaces/:workspaceId/dashboards/:dashboardId',
        exact: true,
        component: StudioLegacySubappProviderHOC(StudioView),
      },
      {
        path:
          '/:orgLabel/:projectLabel/studios/:studioId/workspaces/:workspaceId/dashboards/:dashboardId/studioResource/:studioResourceId',
        exact: true,
        component: StudioLegacySubappProviderHOC(StudioView),
      },
    ],
  };
};

export default StudioLegacy;
