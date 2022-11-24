import * as React from 'react';
import { Realm } from '@bbp/nexus-sdk';
import { UserManager } from 'oidc-client';
import './FusionMainLayout.less';
export interface FusionMainLayoutProps {
  authenticated: boolean;
  realms: Realm[];
  serviceAccountsRealm: string;
  token?: string;
  name?: string;
  canLogin?: boolean;
  loginError?: {
    error: Error;
  };
  userManager?: UserManager;
  apiEndpoint: string;
  children: any[];
  subApps: SubAppProps[];
  setPreferredRealm(name: string): void;
  performLogin(): void;
  layoutSettings: {
    docsLink: string;
    logoImg: string;
    forgeLink: string;
  };
}
export declare type ConsentType = {
  consentToTracking: boolean;
  hasSetPreferences: boolean;
};
export declare type SubAppProps = {
  subAppType: string;
  label: string;
  key: string;
  route: string;
  icon: any;
  url?: string;
  requireLogin?: boolean;
  description?: string;
};
declare const _default: import('react-redux').ConnectedComponent<
  React.FC<FusionMainLayoutProps>,
  Pick<FusionMainLayoutProps, 'children' | 'subApps'> &
    import('react-redux').ConnectProps
>;
export default _default;
