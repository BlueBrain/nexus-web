import * as React from 'react';
import { Menu, Dropdown, Popover, Button, Tooltip, Divider, Tag } from 'antd';
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
import { parseUserAgent } from 'react-device-detect';
import { CopyIcon } from '../../images/CopyIcon';
import { Subtitle } from '../../styled_components/typography/Subtitle/Subtitle';

const epflLogo = require('../../images/EPFL-logo.svg');
const infoIcon = require('../../images/infoIcon.svg');
const copyIcon = require('../../images/copyIcon.svg');

export interface EnvironmentInfo {
  deltaVersion: string;
  fusionVersion: string;
  environmentName: string;
  
  operatingSystem: string;
  browser: string;
}

const envInfoForClipboard = (env: EnvironmentInfo) => {
  return `
      Delta: ${env.deltaVersion}
      Fusion: ${env.fusionVersion}
      Environment: ${env.environmentName}

      Platform Information:
      Operating System: ${env.operatingSystem}
      Browser: ${env.browser}
    `;
};

const documentationURL = 'https://bluebrainnexus.io/docs';
const repoUrl = 'https://github.com/BlueBrain/nexus-web';
const releaseNoteUrl = 'https://github.com/BlueBrain/nexus-web/releases';

interface InformationContentProps {
  environment: EnvironmentInfo;
  githubIssueURL: string;
  commitHash?: string;
  consent?: ConsentType;
  onClickRemoveConsent?(): void;
}

export const InformationContent = (props: InformationContentProps) => {
  return (
    <div className="information-panel">
      <Subtitle>About</Subtitle>
      <p className="text">
        Nexus is Open Source and available under the Apache 2 License.{' '}
      </p>

      <Divider className="divider" />

      <p className="subtext">
        © 2017-2022
        <a href="https://www.epfl.ch/" target="_blank">
          <img
            style={{ width: '3em', marginBottom: 3, marginLeft: '20px' }}
            src={epflLogo}
            alt="EPFL"
          />
        </a>
        {'| '}
        <a href="https://bluebrain.epfl.ch/" target="_blank">
          <span className="bbp-logo">Blue Brain Project</span>
        </a>
      </p>
      <Divider className="divider" />

      <div className="nexus-service-header">
        <Subtitle className="nexus-services">Nexus Services</Subtitle>
        <Tag color="blue" className="tag" data-testid="environment-name">
          {props.environment.environmentName}
        </Tag>
        <Copy
          render={(copySuccess, triggerCopy) => (
            <Tooltip
              title={copySuccess ? 'Copied!' : 'Copy Environment Information'}
            >
              <Button
                aria-label='copy-environment-information'
                onClick={() =>
                  triggerCopy(envInfoForClipboard(props.environment))
                }
                type="text"
                icon={<CopyIcon />}
                size="small"
                className="copy-icon"
              />
            </Tooltip>
          )}
        />
      </div>

      <div className="flex">
        <div className="info-card" data-testid="delta-version">
          <h5 className="card-title">Nexus Delta</h5>
          <p className="card-body">{props.environment.deltaVersion}</p>
        </div>
        <div className="info-card" data-testid="fusion-version">
          <h5 className="card-title">Nexus Fusion</h5>
          <a
            className="card-body"
            href={`${repoUrl}/commits/${props.commitHash}`}
            target="_blank"
          >
            {props.environment.fusionVersion}
          </a>
        </div>
      </div>

      <Divider className="divider" />

      <p className="info-links">
        <a href={documentationURL} target="_blank">
          <BookOutlined /> Documentation
        </a>
        <a href={props.githubIssueURL} target="_blank">
          <GithubOutlined /> Report Issue
        </a>
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
    </div>
  );
};
export interface HeaderProps {
  environment: EnvironmentInfo;
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
  environment,
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

  const info = parseUserAgent(navigator.userAgent);

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
                <img src={copyIcon} style={{ color: 'red' }} />{' '}
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
              environment={environment}
              githubIssueURL={githubIssueURL}
              consent={consent}
              onClickRemoveConsent={onClickRemoveConsent}
              commitHash={commitHash}
            />
          }
          trigger="click"
          placement="bottomRight"
          className="information-panel"
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
