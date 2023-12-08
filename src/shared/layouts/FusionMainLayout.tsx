import './FusionMainLayout.scss';

import { Layout } from 'antd';
import { MenuItemProps } from 'antd/lib/menu/MenuItem';
import { getUserManager } from 'authManager';
import { isEmpty } from 'lodash';
import * as React from 'react';
import { useSelector } from 'react-redux';

import Header from '../components/Header/Header';
import ConsentContainer from '../containers/ConsentContainer';
import useLocalStorage from '../hooks/useLocalStorage';
import { RootState } from '../store/reducers';
import SeoHeaders from './SeoHeaders';

const { Content } = Layout;

export type ConsentType = {
  consentToTracking: boolean;
  hasSetPreferences: boolean;
};

export type SubAppProps = {
  subAppType: string;
  label: string;
  key: string;
  route: string;
  icon: any;
  url?: string;
  requireLogin?: boolean;
  description?: string;
};

const FusionMainLayout: React.FC<{
  environment: string;
  children: React.ReactNode;
}> = ({ environment, children }) => {
  const [consent, setConsent] = useLocalStorage<ConsentType>('consentToTracking');
  const state = useSelector((state: RootState) => state);
  const { oidc, config } = useSelector((state: RootState) => ({
    auth: state.auth,
    oidc: state.oidc,
    config: state.config,
  }));
  const { layoutSettings } = config;
  const token = oidc && oidc.user && !!oidc.user.access_token;
  const name = oidc.user && oidc.user.profile && oidc.user.profile.preferred_username;
  const userManager = getUserManager(state);
  const authenticated = !isEmpty(oidc.user);

  const handleLogout: MenuItemProps['onClick'] = (e) => {
    e.domEvent.preventDefault();
    localStorage.removeItem('nexus__state');
    userManager && userManager.signoutRedirect();
  };
  return (
    <>
      <SeoHeaders />
      <Layout className={`fusion-main-layout ${token ? 'authed' : 'wall'}`}>
        <Header
          environment={environment}
          name={authenticated ? name : undefined}
          token={token ? oidc.user?.access_token : undefined}
          handleLogout={handleLogout}
          logoImg={layoutSettings.logoImg}
        />
        <ConsentContainer consent={consent} updateConsent={setConsent} />
        <Content className="site-layout-background fusion-main-layout__content">{children}</Content>
      </Layout>
    </>
  );
};

export default FusionMainLayout;
