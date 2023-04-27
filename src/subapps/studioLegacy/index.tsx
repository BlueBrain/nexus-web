import * as React from 'react';
import { SubApp } from '..';
import StudioView from './views/StudioView';
import FusionStudiosPage from '../../pages/StudiosPage/StudiosPage';
// import StudioAdminView from './views/StudioAdminView';

const subAppType = 'internal';
const title = 'Studios';
const namespace = 'studios';
const icon = require('../../shared/images/gridIcon.svg');
const requireLogin = false;
const description =
  'Visualize query results from Nexus Delta in customizable views';

const studioLegacySubappProps = {
  subAppType,
  title,
  namespace,
  icon,
  requireLogin,
  description,
};

export const StudioLegacySubappContext = React.createContext<{
  title: string;
  namespace: string;
  icon: string;
  requireLogin: boolean;
  description: string;
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
        component: StudioLegacySubappProviderHOC(FusionStudiosPage),
        protected: false,
      },
      {
        path: '/:orgLabel/:projectLabel/studios',
        exact: true,
        component: StudioLegacySubappProviderHOC(FusionStudiosPage),
        protected: false,
      },
      {
        path: '/:orgLabel/:projectLabel/studios/:studioId',
        component: StudioLegacySubappProviderHOC(StudioView),
        protected: false,
      },
    ],
  };
};

export default StudioLegacy;
