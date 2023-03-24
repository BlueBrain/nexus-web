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
    <Menu mode='inline'>
      <Menu.Item>
        <Link to='/my-data'>
          <MenuOutlined />
          My data
        </Link>
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
          <a rel="noopener noreferrer" target="_blank" href='https://bluebrainnexus.io/docs/index.html'>
            <FileTextOutlined />
            <span>Documentation</span>
          </a>
        </Menu.Item>
        <Menu.Item>
          <a  rel="noopener noreferrer" target="_blank"href='https://bluebrainnexus.io/'>
            <LinkOutlined />
            <span>Web Protégé</span>
          </a>
        </Menu.Item>
        <Menu.Item>
          <a rel="noopener noreferrer" target="_blank" href="https://portal.bluebrain.epfl.ch/resources/models/cell-atlas/">
            <LinkOutlined />
            <span>Atlas</span>
          </a>
        </Menu.Item>
      </Menu.SubMenu>
      <Menu.Item>
        <a rel="noopener noreferrer" target="_blank" href='https://portal.bluebrain.epfl.ch/about-2/'>
          <SettingOutlined />
          About
        </a>
      </Menu.Item>
      <Menu.Item onClick={handleLogout} className='menu-item-logout' key={'logout'}>
        <LogoutOutlined />
        Logout
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
        {name && (
          <Dropdown trigger={['click']} overlay={menu} overlayClassName='menu-overlay-custom'>
            <a className="menu-dropdown ant-dropdown-link">
              <UserOutlined />
              <span>{name}</span>
            </a>
          </Dropdown>
        )}
      </div>
    </header>
  );
};

export default Header;
