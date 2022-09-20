import * as React from 'react';
import { Menu, Dropdown, Popover } from 'antd';
import {
  BookOutlined,
  GithubOutlined,
  DownOutlined,
  LoginOutlined,
} from '@ant-design/icons';
import { Realm } from '@bbp/nexus-sdk';
import Copy from '../Copy';
import ConsentPreferences from '../ConsentPreferences';
import { ConsentType } from '../../layouts/FusionMainLayout';

import './Header.less';
import Navigation from './Navigation';

declare var Version: string;

const epflLogo = require('../../images/EPFL-logo.svg');
const infoIcon = require('../../images/infoIcon.svg');
const copyIcon = require('../../images/copyIcon.svg');

const documentationURL = 'https://bluebrainnexus.io/docs';
const repoUrl = 'https://github.com/BlueBrain/nexus-web';
const releaseNoteUrl = 'https://github.com/BlueBrain/nexus-web/releases';

interface InformationContentProps {
  version: string;
  githubIssueURL: string;
  commitHash?: string;
  consent?: ConsentType;
  onClickRemoveConsent?(): void;
}

const InformationContent = (props: InformationContentProps) => {
  return (
    <>
      <p>Nexus is Open Source and available under the Apache 2 License. </p>
      <p>
        © 2017-2022
        <a href="https://www.epfl.ch/" target="_blank">
          <img
            style={{ width: '3em', marginBottom: 3 }}
            src={epflLogo}
            alt="EPFL"
          />
        </a>
        {'| '}
        <a href="https://bluebrain.epfl.ch/" target="_blank">
          <span className="bbp-logo">Blue Brain Project</span>
        </a>
      </p>
      <h4>Nexus Services</h4>
      <p>
        Nexus Delta v{props.version} <br />
        <a href={`${repoUrl}/commits/${props.commitHash}`} target="_blank">
          Nexus Fusion {Version}
        </a>
      </p>
      <p>
        <a href={documentationURL} target="_blank">
          <BookOutlined /> Documentation
        </a>
        {' | '}
        <a href={props.githubIssueURL} target="_blank">
          <GithubOutlined /> Report Issue
        </a>
        {' | '}
        <a href={releaseNoteUrl} target="_blank">
          <GithubOutlined /> Fusion Release Notes
        </a>
      </p>
      {
        <ConsentPreferences
          onClickRemove={props.onClickRemoveConsent}
          consent={props.consent}
        />
      }
    </>
  );
};
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

const Header: React.FunctionComponent<HeaderProps> = ({
  name,
  realms,
  serviceAccountsRealm,
  token,
  displayLogin = true,
  links = [],
  children,
  version,
  githubIssueURL,
  forgeLink,
  consent,
  commitHash,
  dataCart,
  onClickRemoveConsent,
  performLogin,
  subApps,
  authenticated,
}) => {
  const menu = (
    <Menu>
      {links.map((link, i) => (
        <Menu.Item key={i}>{link}</Menu.Item>
      ))}
    </Menu>
  );

  const realmsFilter = realms.filter(
    r => r._label !== serviceAccountsRealm && !r._deprecated
  );

  const realmMenu = (
    <Menu>
      {realmsFilter.map((r: Realm, i: number) => (
        <Menu.Item
          key={i}
          title={r.name}
          onClick={e => {
            e.domEvent.preventDefault();
            performLogin(realmsFilter[i].name);
          }}
        >
          {r.name}
        </Menu.Item>
      ))}
    </Menu>
  );

  return (
    <header className="Header">
      <div className="selectors">{children}</div>
      <div className="menu-block">
        {name && forgeLink !== '' && (
          <a href={forgeLink} target="_blank" className="forge-button">
            Forge Templates
          </a>
        )}
        {token && (
          <Copy
            render={(copySuccess, triggerCopy) => (
              <button
                className="copy-token-button"
                onClick={() => {
                  triggerCopy(token);
                }}
              >
                <img src={copyIcon} />{' '}
                {copySuccess ? (
                  <span className="button-text">Copied!</span>
                ) : (
                  <span className="button-text">Copy token</span>
                )}
              </button>
            )}
          />
        )}
        {dataCart}
        <Popover
          content={
            <InformationContent
              version={version}
              githubIssueURL={githubIssueURL}
              consent={consent}
              onClickRemoveConsent={onClickRemoveConsent}
              commitHash={commitHash}
            />
          }
          trigger="click"
          title="Information"
          placement="bottomRight"
        >
          <img
            src={infoIcon}
            className="ui-header-info-button"
            alt="Information"
          />
        </Popover>
        <Navigation authenticated={authenticated} subApps={subApps} />
        {name ? (
          <Dropdown overlay={menu}>
            <a className="menu-dropdown ant-dropdown-link">
              {name} <DownOutlined />
            </a>
          </Dropdown>
        ) : displayLogin ? (
          <Dropdown overlay={realmMenu}>
            <a className="menu-dropdown ant-dropdown-link">
              login <LoginOutlined />
            </a>
          </Dropdown>
        ) : null}
      </div>
    </header>
  );
};

export default Header;
