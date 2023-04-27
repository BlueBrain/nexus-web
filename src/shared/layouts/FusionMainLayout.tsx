import * as React from 'react';
import { useSelector } from 'react-redux';
import { Layout } from 'antd';
import { MenuItemProps } from 'antd/lib/menu/MenuItem';
import { RootState } from '../store/reducers';
import Header from '../components/Header';
import SeoHeaders from './SeoHeaders';
import ConsentContainer from '../containers/ConsentContainer';
import getUserManager from '../../client/userManager';
import useLocalStorage from '../hooks/useLocalStorage';
import './FusionMainLayout.less';

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

const FusionMainLayout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [consent, setConsent] = useLocalStorage<ConsentType>(
    'consentToTracking'
  );
  const state = useSelector((state: RootState) => state);
  const { oidc, config } = useSelector((state: RootState) => ({
    auth: state.auth,
    oidc: state.oidc,
    config: state.config,
  }));
  const { layoutSettings } = config;
  const token = oidc.user && oidc.user.access_token;
  const name =
    oidc.user && oidc.user.profile && oidc.user.profile.preferred_username;
  const userManager = getUserManager(state);
  const authenticated = !!oidc.user;

  const handleLogout: MenuItemProps['onClick'] = e => {
    e.domEvent.preventDefault();
    localStorage.removeItem('nexus__state');
    userManager && userManager.signoutRedirect();
  };
  return (
    <>
      <SeoHeaders />
      <Layout className={`fusion-main-layout ${token ? 'authed' : 'wall'}`}>
        {token && (
          <Header
            name={authenticated ? name : undefined}
            token={token}
            handleLogout={handleLogout}
            logoImg={layoutSettings.logoImg}
          />
        )}
        <ConsentContainer consent={consent} updateConsent={setConsent} />
        <Content className="site-layout-background fusion-main-layout__content">
          {children}
        </Content>
      </Layout>
    </>
  );
};

export default FusionMainLayout;
