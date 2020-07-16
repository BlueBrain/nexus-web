import * as React from 'react';
import { Menu, Dropdown, Icon, Popover, Button } from 'antd';

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
  serviceVersions?: ServiceVersions;
  consent?: ConsentType;
  onClickRemoveConsent?(): void;
}

export type ServiceVersions = {
  nexus: string;
  admin: string;
  blazegraph: string;
  elasticsearch: string;
  iam: string;
  kg: string;
  storage: string;
};

const VersionInfo = (props: ServiceVersions) => {
  return (
    <>
      <h4 className="popover-title">Nexus Services</h4>
      {props.nexus && (
        <p>
          <label>Nexus</label> v{props.nexus}
        </p>
      )}
      <p>
        <label>Admin</label> v{props.admin}
      </p>
      <p>
        <label>IAm</label> v{props.iam}
      </p>
      <p>
        <label>Knowledge Graph</label> v{props.kg}
      </p>
      <h4 className="popover-title">Index Services</h4>
      <p>
        <label>Blaze Graph</label> v{props.blazegraph}
      </p>
      <p>
        <label>Elastic Search</label> v{props.elasticsearch}
      </p>
    </>
  );
};

const InformationContent = (props: InformationContentProps) => {
  return (
    <>
      <p>Nexus is Open Source and available under the Apache 2 License. </p>
      <p>v{props.version} </p>
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
      {props.serviceVersions ? (
        <VersionInfo {...props.serviceVersions} />
      ) : null}
      <p>
        <a href={documentationURL} target="_blank">
          <Icon type="book" /> Documentation
        </a>
        {' | '}
        <a href={props.githubIssueURL} target="_blank">
          <Icon type="github" /> Report Issue
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
  displayLogin?: boolean;
  children?: React.ReactChild;
  onLoginClick?(): void;
  serviceVersions?: ServiceVersions;
  consent?: ConsentType;
  onClickRemoveConsent?(): void;
}

const Header: React.FunctionComponent<HeaderProps> = ({
  name,
  token,
  displayLogin = true,
  links = [],
  children,
  onLoginClick,
  version,
  githubIssueURL,
  serviceVersions,
  consent,
  onClickRemoveConsent,
}) => {
  const menu = (
    <Menu>
      {links.map((link, i) => (
        <Menu.Item key={i}>{link}</Menu.Item>
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
              serviceVersions={serviceVersions}
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
              {name} <Icon type="down" />
            </a>
          </Dropdown>
        ) : displayLogin ? (
          <a className="menu-dropdown ant-dropdown-link" onClick={onLoginClick}>
            login <Icon type="login" />
          </a>
        ) : null}
      </div>
    </header>
  );
};

export default Header;
