import React, { Fragment, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLocation } from 'react-router';
import { Menu, Dropdown, MenuItemProps } from 'antd';
import {
  UserOutlined,
  BookOutlined,
  SettingOutlined,
  FileTextOutlined,
  LinkOutlined,
  LogoutOutlined,
  CopyOutlined,
  MenuOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { Realm } from '@bbp/nexus-sdk';
import { UISettingsActionTypes } from '../../../shared/store/actions/ui-settings';
import { triggerCopy as copyCmd } from '../../utils/copy';
import { RootState } from '../../../shared/store/reducers';
import { updateAboutModalVisibility } from '../../../shared/store/actions/modals';
import useNotification from '../../../shared/hooks/useNotification';
import './Header.less';

export interface HeaderProps {
  githubIssueURL: string;
  forgeLink: string;
  name?: string;
  token?: string;
  links?: React.ReactNode[];
  realms: Realm[];
  serviceAccountsRealm: string;
  displayLogin?: boolean;
  children?: React.ReactChild;
  onClickRemoveConsent?(): void;
  performLogin(realmName: string): void;
  subApps: any;
  authenticated: boolean;
  logoImg: string;
  handleLogout: MenuItemProps['onClick'];
}
const headerIconStyle = { marginRight: 4 };
const Header: React.FunctionComponent<HeaderProps> = ({
  name,
  token,
  logoImg,
  handleLogout,
}) => {
  const dispatch = useDispatch();
  const location = useLocation();
  const notification = useNotification();
  const { openCreationPanel } = useSelector(
    (state: RootState) => state.uiSettings
  );
  const copyTokenCmd = () => {
    if (token) {
      copyCmd(token);
      notification.success({
        message: 'Token copied to clipboard 📄',
        position: 'bottomRight',
      });
    }
  };
  const openAboutModal = () => dispatch(updateAboutModalVisibility(true));
  const menu = (
    <Menu mode="inline" className="ant-menu-inline">
      <Menu.Item className="link-menu-item" key="header-menu-my-profile">
        <Link to="/user">
          <UserOutlined style={headerIconStyle} />
          My Profile
        </Link>
      </Menu.Item>
      <Menu.Item className="link-menu-item" key="header-menu-my-date">
        <Link to="/my-data">
          <MenuOutlined style={headerIconStyle} />
          My data
        </Link>
      </Menu.Item>
      {token && (
        <Menu.Item onClick={copyTokenCmd} key="header-menu-my-token">
          <CopyOutlined style={headerIconStyle} />
          Copy token
        </Menu.Item>
      )}
      <Menu.SubMenu
        key="header-menu-resources"
        className="submenu-overlay-custom"
        popupClassName="submenu-overlay-custom-popup"
        title={
          <>
            <BookOutlined style={headerIconStyle} />
            <span>Resources</span>
          </>
        }
      >
        <Menu.Item key="header-menu-resources-docs">
          <a
            rel="noopener noreferrer"
            target="_blank"
            href="https://bluebrainnexus.io/docs/index.html"
          >
            <FileTextOutlined style={headerIconStyle} />
            <span>Documentation</span>
          </a>
        </Menu.Item>
        <Menu.Item key="header-menu-resources-web">
          <a
            rel="noopener noreferrer"
            target="_blank"
            href="https://bbp.epfl.ch/nexus/webprotege/"
          >
            <LinkOutlined style={headerIconStyle} />
            <span>Web Protégé</span>
          </a>
        </Menu.Item>
        <Menu.Item key="header-menu-resources-atlas">
          <a
            rel="noopener noreferrer"
            target="_blank"
            href="https://bbp.epfl.ch/nexus/cell-atlas/"
          >
            <LinkOutlined style={headerIconStyle} />
            <span>Atlas</span>
          </a>
        </Menu.Item>
      </Menu.SubMenu>
      <Menu.Item className="link-menu-item" onClick={openAboutModal}>
        <SettingOutlined style={headerIconStyle} />
        About
      </Menu.Item>
      <Menu.Item
        onClick={handleLogout}
        className="menu-item-logout"
        key={'logout'}
      >
        <LogoutOutlined style={headerIconStyle} />
        Logout
      </Menu.Item>
    </Menu>
  );
  const showCreationPanel = location.pathname === '/search';
  const handleOpenCreationPanel = () =>
    dispatch({ type: UISettingsActionTypes.CHANGE_HEADER_CREATION_PANEL });
  return (
    <Fragment>
      <header id="header" className="Header">
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
          {name && showCreationPanel && (
            <div
              role="button"
              className="menu-open-creation-panel"
              onClick={handleOpenCreationPanel}
            >
              <PlusOutlined
                rotate={openCreationPanel ? 45 : 90}
                style={{ color: 'white', fontSize: 18 }}
              />
            </div>
          )}
          {name && (
            <Dropdown
              trigger={['click']}
              overlay={menu}
              overlayClassName="menu-overlay-custom"
            >
              <a className="menu-dropdown ant-dropdown-link">
                <UserOutlined />
                <span>{name}</span>
              </a>
            </Dropdown>
          )}
        </div>
      </header>
    </Fragment>
  );
};

export default Header;
