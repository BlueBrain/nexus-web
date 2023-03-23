import * as React from 'react';
import { Link } from 'react-router-dom';
import { Menu, Dropdown, Popover, MenuItemProps } from 'antd';
import { UserOutlined, LoginOutlined, BookOutlined, SettingOutlined, FileTextOutlined, LinkOutlined, LogoutOutlined, CopyOutlined, MenuOutlined } from '@ant-design/icons';
import { Realm } from '@bbp/nexus-sdk';
import { ConsentType } from '../../layouts/FusionMainLayout';
import Copy from '../Copy';
import { triggerCopy as copyCmd } from '../../utils/copy';
import './Header.less';


declare var Version: string;

const epflLogo = require('../../images/EPFL-logo.svg');
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
  logoImg: string;
  handleLogout: MenuItemProps['onClick'];
}

const Header: React.FunctionComponent<HeaderProps> = ({
  name,
  realms,
  serviceAccountsRealm,
  token,
  displayLogin = true,
  // links = [],
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
  logoImg,
  handleLogout
}) => {
  const menu = (
    <Menu>
      <Menu.Item>
        <MenuOutlined />
        My data
      </Menu.Item>
      {token &&
          <Menu.Item
            onClick={() => {
              copyCmd(token);
            }}
          >
            <CopyOutlined />
            Copy token
          </Menu.Item>
      }
      <Menu.SubMenu className='submenu-overlay-custom' popupClassName='submenu-overlay-custom-popup' title={(
        <>
          <BookOutlined />
          <span>Resources</span>
        </>
      )}>
        <Menu.Item>
          <FileTextOutlined />
          <span>Documentation</span>
        </Menu.Item>
        <Menu.Item>
          <LinkOutlined />
          <span>Web Protégé</span>
        </Menu.Item>
        <Menu.Item>
          <LinkOutlined />
          <span>Atlas</span>
        </Menu.Item>
      </Menu.SubMenu>
      <Menu.Item>
        <SettingOutlined />
        About
      </Menu.Item>
      <Menu.Item onClick={handleLogout} className='menu-item-logout' key={'logout'}>
        <LogoutOutlined />
        Logout
      </Menu.Item>
    </Menu>
  );

  const realmsFilter = realms.filter(
    r => r._label !== serviceAccountsRealm && !r._deprecated
  );

  const realmMenu = (
    <Menu>
      <Menu.SubMenu className='submenu-overlay-custom' popupClassName='submenu-overlay-custom-popup' title={(
        <>
          <LoginOutlined />
          <span>Login</span>
        </>
      )}>
        {realmsFilter.map((r: Realm, i: number) => (
          <Menu.Item
            key={i}
            title={r.name}
            onClick={e => {
              e.domEvent.preventDefault();
              performLogin(realmsFilter[i].name);
            }}
          >
            <LoginOutlined />
            {r.name}
          </Menu.Item>
        ))}
      </Menu.SubMenu>
      <Menu.SubMenu className='submenu-overlay-custom' popupClassName='submenu-overlay-custom-popup' title={(
        <>
          <BookOutlined />
          <span>Resources</span>
        </>
      )}>
        <Menu.Item>
          <FileTextOutlined />
          <span>Documentation</span>
        </Menu.Item>
        <Menu.Item>
          <LinkOutlined />
          <span>Web Protégé</span>
        </Menu.Item>
        <Menu.Item>
          <LinkOutlined />
          <span>Atlas</span>
        </Menu.Item>
      </Menu.SubMenu>
      <Menu.Item>
        <SettingOutlined />
        <span>About</span>
      </Menu.Item>
    </Menu>
  );

  return (
    <header className="Header">
      <div className="logo-container">
        <Link to="/">
          <div className="logo-container__logo">
            <img
              src={logoImg || require('../../images/fusion_logo.png')}
              alt="Logo"
            />
          </div>
        </Link>
      </div>
      <div className="menu-block">
        {name ? (
          <Dropdown trigger={['click']} overlay={menu} overlayClassName='menu-overlay-custom'>
            <a className="menu-dropdown ant-dropdown-link">
              <UserOutlined />
              <span>{name}</span>
            </a>
          </Dropdown>
        ) : displayLogin ? (
          <Dropdown trigger={['click']} overlay={realmMenu} overlayClassName='menu-overlay-custom'>
            <a className="menu-dropdown ant-dropdown-link">
              Start
            </a>
          </Dropdown>
        ) : null}
      </div>
    </header>
  );
};

export default Header;
