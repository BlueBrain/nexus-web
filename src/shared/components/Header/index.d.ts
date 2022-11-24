import * as React from 'react';
import { Realm } from '@bbp/nexus-sdk';
import { ConsentType } from '../../layouts/FusionMainLayout';
import './Header.less';
export interface HeaderProps {
  version: string;
  githubIssueURL: string;
  forgeLink: string;
  name?: string;
  token?: string;
  links?: React.ReactNode[];
  realms: Realm[];
  serviceAccountsRealm: string;
  displayLogin?: boolean;
  children?: React.ReactChild;
  consent?: ConsentType;
  commitHash?: string;
  dataCart?: React.ReactNode;
  onClickRemoveConsent?(): void;
  performLogin(realmName: string): void;
  subApps: any;
  authenticated: boolean;
}
declare const Header: React.FunctionComponent<HeaderProps>;
export default Header;
