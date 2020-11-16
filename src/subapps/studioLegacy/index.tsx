import * as React from 'react';
import { SubApp } from '..';
import StudioView from './views/StudioView';
import StudioAdminView from './views/StudioAdminView';
import StudioListView from './views/StudioListView';

const subAppType = 'internal';
const title = 'Studios';
const namespace = 'studios';
const icon = require('../../shared/images/gridIcon.svg');
const requireLogin = false;

const studioLegacySubappProps = {
  subAppType,
  title,
  namespace,
  icon,
  requireLogin,
};

export const StudioLegacySubappContext = React.createContext<{
  title: string;
  namespace: string;
  icon: string;
  requireLogin: boolean;
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
        path: '/:orgLabel/:projectLabel/studios',
        exact: true,
        component: StudioLegacySubappProviderHOC(StudioAdminView),
      },
      {
        path: '/:orgLabel/:projectLabel/studios/:studioId',
        component: StudioLegacySubappProviderHOC(StudioView),
      },
    ],
  };
};

export default StudioLegacy;
