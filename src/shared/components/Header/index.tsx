import * as React from 'react';
import { Fragment, useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Dropdown, Popover, MenuItemProps } from 'antd';
import { UserOutlined, LoginOutlined, BookOutlined, SettingOutlined, FileTextOutlined, LinkOutlined, LogoutOutlined, CopyOutlined, MenuOutlined } from '@ant-design/icons';
import { Realm } from '@bbp/nexus-sdk';
import useNotification from '../../../shared/hooks/useNotification';
import { ConsentType } from '../../layouts/FusionMainLayout';
import { triggerCopy as copyCmd } from '../../utils/copy';
import { AppInfo } from '../../../shared/modals';
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
  token,
  logoImg,
  handleLogout,
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
  const notification = useNotification();
  const [visible, setModalVisible] = useState<boolean>(false);
  const onModalStateChange = () => setModalVisible(() => false);
  const copyTokenCmd = () => {
    if (token) {
      copyCmd(token);
      notification.success({
        message: 'Token copied to clipboard 📄',
        position: 'bottomRight',
      })
    }
  }
  const menu = (
    <Menu mode='inline' className='ant-menu-inline'>
      <Menu.Item className='link-menu-item' key='header-menu-my-date'>
        <Link to='/my-data'>
          <MenuOutlined />
          My data
        </Link>
      </Menu.Item>
      {token &&
        <Menu.Item onClick={copyTokenCmd} key='header-menu-my-token'>
          <CopyOutlined />
          Copy token
        </Menu.Item>
      }
      <Menu.SubMenu
        key='header-menu-resources'
        className='submenu-overlay-custom'
        popupClassName='submenu-overlay-custom-popup'
        title={(
          <>
            <BookOutlined />
            <span>Resources</span>
          </>
        )}>
        <Menu.Item key='header-menu-resources-docs'>
          <a rel="noopener noreferrer" target="_blank" href='https://bluebrainnexus.io/docs/index.html'>
            <FileTextOutlined />
            <span>Documentation</span>
          </a>
        </Menu.Item>
        <Menu.Item key='header-menu-resources-web'>
          <a rel="noopener noreferrer" target="_blank" href='https://bluebrainnexus.io/'>
            <LinkOutlined />
            <span>Web Protégé</span>
          </a>
        </Menu.Item>
        <Menu.Item key='header-menu-resources-atlas'>
          <a rel="noopener noreferrer" target="_blank" href="https://portal.bluebrain.epfl.ch/resources/models/cell-atlas/">
            <LinkOutlined />
            <span>Atlas</span>
          </a>
        </Menu.Item>
      </Menu.SubMenu>
      <Menu.Item className='link-menu-item' onClick={() => setModalVisible(() => true)}>
        <SettingOutlined />
        About
      </Menu.Item>
      <Menu.Item onClick={handleLogout} className='menu-item-logout' key={'logout'}>
        <LogoutOutlined />
        Logout
      </Menu.Item>
    </Menu>
  );

  return (
    <Fragment>
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
      <AppInfo {... { 
        githubIssueURL, version, commitHash, consent, visible, 
        onClickRemoveConsent, onModalStateChange 
      }} />
    </Fragment>
  );
};

export default Header;
