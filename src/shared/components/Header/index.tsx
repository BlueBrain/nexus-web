import * as React from 'react';
import * as packageJson from '../../../../package.json';
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

const epflLogo = require('../../images/EPFL-logo.svg');
const infoIcon = require('../../images/infoIcon.svg');
const copyIcon = require('../../images/copyIcon.svg');

const documentationURL = 'https://bluebrainnexus.io/docs';

interface InformationContentProps {
  version: string;
  githubIssueURL: string;
  consent?: ConsentType;
  onClickRemoveConsent?(): void;
}

const InformationContent = (props: InformationContentProps) => {
  return (
    <>
      <p>Nexus is Open Source and available under the Apache 2 License. </p>
      <p>
        © 2017-2020
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
        Nexus Fusion v{packageJson.version}
      </p>
      <p>
        <a href={documentationURL} target="_blank">
          <BookOutlined /> Documentation
        </a>
        {' | '}
        <a href={props.githubIssueURL} target="_blank">
          <GithubOutlined /> Report Issue
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
  name?: string;
  token?: string;
  links?: React.ReactNode[];
  realms: Realm[];
  displayLogin?: boolean;
  children?: React.ReactChild;
  consent?: ConsentType;
  onClickRemoveConsent?(): void;
  onClickSideBarToggle(): void;
  performLogin(realmName: string): void;
}

const Header: React.FunctionComponent<HeaderProps> = ({
  name,
  realms,
  token,
  displayLogin = true,
  links = [],
  children,
  version,
  githubIssueURL,
  consent,
  onClickRemoveConsent,
  onClickSideBarToggle,
  performLogin,
}) => {
  const menu = (
    <Menu>
      {links.map((link, i) => (
        <Menu.Item key={i}>{link}</Menu.Item>
      ))}
    </Menu>
  );

  const realmsFilter = realms.filter(
    r => r._label !== 'serviceaccounts' && !r._deprecated
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
        {token && (
          <Copy
            textToCopy={token}
            render={(copySuccess, triggerCopy) => (
              <button
                className="copy-token-button"
                onClick={() => triggerCopy()}
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
        <Popover
          content={
            <InformationContent
              version={version}
              githubIssueURL={githubIssueURL}
              consent={consent}
              onClickRemoveConsent={onClickRemoveConsent}
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
