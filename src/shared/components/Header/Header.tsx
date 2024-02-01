import React from 'react';
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
import { UISettingsActionTypes } from '../../store/actions/ui-settings';
import { RootState } from '../../store/reducers';
import { updateAboutModalVisibility } from '../../store/actions/modals';
import { triggerCopy as copyCmd } from '../../utils/copy';
import { AdvancedModeToggle } from '../../molecules';
import useNotification from '../../hooks/useNotification';
import fusionLogo from '../../images/fusion.svg';

import './Header.scss';

export interface HeaderProps {
  name?: string;
  token?: string;
  environment: string;
  logoImg: string;
  handleLogout: MenuItemProps['onClick'];
  children?: React.ReactChild;
}
const headerIconStyle = { marginRight: 4 };
const Header: React.FunctionComponent<HeaderProps> = ({
  name,
  token,
  environment,
  logoImg,
  handleLogout,
}) => {
  const dispatch = useDispatch();
  const location = useLocation();
  const notification = useNotification();
  const { openCreationPanel } = useSelector(
    (state: RootState) => state.uiSettings
  );
  const notShowDefaultHeader =
    (!token && location.pathname === '/') || location.pathname === '/login';
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
    <Menu
      className="ant-menu-inline"
      items={[
        {
          key: 'header-menu-my-profile',
          label: (
            <Link to="/user">
              <UserOutlined style={headerIconStyle} />
              My Profile
            </Link>
          ),
          className: 'link-menu-item',
        },
        {
          key: 'header-menu-my-date',
          label: (
            <Link to="/my-data">
              <MenuOutlined style={headerIconStyle} />
              My data
            </Link>
          ),
          className: 'link-menu-item',
        },
        ...(token
          ? [
              {
                key: 'header-menu-my-token',
                label: (
                  <>
                    <CopyOutlined style={headerIconStyle} />
                    Copy token
                  </>
                ),
                onClick: () => copyTokenCmd(),
              },
            ]
          : []),
        {
          key: 'header-menu-resources',
          label: (
            <>
              <BookOutlined style={headerIconStyle} />
              <span>Resources</span>
            </>
          ),
          className: 'submenu-overlay-custom',
          popupClassName: 'submenu-overlay-custom-popup',
          children: [
            {
              key: 'header-menu-resources-docs',
              label: (
                <a
                  rel="noopener noreferrer"
                  target="_blank"
                  href="https://bluebrainnexus.io/docs/index.html"
                >
                  <FileTextOutlined style={headerIconStyle} />
                  <span>Documentation</span>
                </a>
              ),
            },
            {
              key: 'header-menu-resources-web',
              label: (
                <a
                  rel="noopener noreferrer"
                  target="_blank"
                  href="https://bbp.epfl.ch/nexus/webprotege/"
                >
                  <LinkOutlined style={headerIconStyle} />
                  <span>Web Protégé</span>
                </a>
              ),
            },
            {
              key: 'header-menu-resources-atlas',
              label: (
                <a
                  rel="noopener noreferrer"
                  target="_blank"
                  href={
                    environment === 'dev'
                      ? 'http://cell-atlas.kcpdev.bbp.epfl.ch/'
                      : 'https://bbp.epfl.ch/nexus/cell-atlas/'
                  }
                >
                  <LinkOutlined style={headerIconStyle} />
                  <span>Atlas</span>
                </a>
              ),
            },
          ],
        },
        {
          key: 'header-menu-about',
          className: 'link-menu-item',
          onClick: () => openAboutModal(),
          label: (
            <>
              <SettingOutlined style={headerIconStyle} />
              About
            </>
          ),
        },
        {
          key: 'logout',
          className: 'menu-item-logout',
          onClick: event => {
            if (handleLogout) {
              handleLogout(event);
            }
          },
          label: (
            <>
              <LogoutOutlined style={headerIconStyle} />
              Logout
            </>
          ),
        },
      ]}
    />
  );
  const showCreationPanel = location.pathname === '/search';
  const handleOpenCreationPanel = () =>
    dispatch({ type: UISettingsActionTypes.CHANGE_HEADER_CREATION_PANEL });
  if (notShowDefaultHeader) return null;
  return (
    <header id="main-header" className="Header">
      <div className="logo-container">
        <Link to="/">
          <div className="logo-container__logo">
            <img src={logoImg || fusionLogo} alt="Logo" />
          </div>
        </Link>
      </div>
      {token ? (
        <div className="menu-block">
          {name && <AdvancedModeToggle />}
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
              dropdownRender={() => menu}
              overlayClassName="menu-overlay-custom"
              getPopupContainer={() => document.getElementById('main-header')!}
            >
              <a className="menu-dropdown ant-dropdown-link">
                <UserOutlined />
                <span>{name}</span>
              </a>
            </Dropdown>
          )}
        </div>
      ) : (
        <div className="menu-block">
          <Link to="/login" className="menu-dropdown ant-dropdown-link">
            <UserOutlined />
            <span>Login</span>
          </Link>
        </div>
      )}
    </header>
  );
};

export default Header;
