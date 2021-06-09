import * as React from 'react';
import { Layout, Menu } from 'antd';
import { RightCircleOutlined, LeftCircleOutlined } from '@ant-design/icons';

import './SideMenu.less';

const { Sider } = Layout;

const SideMenu: React.FC<{
  selectedItem: any;
  collapsed: boolean;
  onSelectSubAbpp: (data: any) => void;
  subApps: any;
  authenticated: boolean;
  onClickCollapse: () => void;
  layoutSettings: any;
}> = ({
  selectedItem,
  collapsed,
  onSelectSubAbpp,
  subApps,
  authenticated,
  onClickCollapse,
  layoutSettings,
}) => {
  return (
    <Sider trigger={null} collapsible collapsed={collapsed}>
      <a className="side-menu__logo-link" href={layoutSettings.logoLink}>
        <div className="side-menu__logo">
          <img
            height="33"
            src={
              layoutSettings.logoImg === ''
                ? require('../images/fusion_logo.png')
                : layoutSettings.logoImg
            }
            alt="Logo"
          />
        </div>
      </a>
      <div className="side-menu__menu-wrapper">
        <Menu
          style={{ height: '100vh' }}
          theme="dark"
          mode="inline"
          defaultSelectedKeys={
            selectedItem ? [selectedItem.key] : [subApps[0].key]
          }
          selectedKeys={[selectedItem.key]}
          onClick={onSelectSubAbpp}
        >
          {subApps.map((subApp: any) => {
            return subApp.subAppType === 'external' ? (
              <Menu.Item key={subApp.key}>
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href={subApp.url || ''}
                >
                  <div className="side-menu__menu-item">
                    <img className="side-menu__menu-icon" src={subApp.icon} />
                    {!collapsed && <span>{subApp.label}</span>}
                  </div>
                </a>
                {selectedItem.key === subApp.key && (
                  <div
                    className={`side-menu__indicator${
                      collapsed ? ' side-menu__indicator--collapsed' : ''
                    }`}
                  />
                )}
              </Menu.Item>
            ) : subApp.requireLogin && !authenticated ? null : (
              <Menu.Item key={subApp.key}>
                <div className="side-menu__menu-item">
                  <img className="side-menu__menu-icon" src={subApp.icon} />
                  {!collapsed && (
                    <span>
                      {subApp.label}
                      {subApp.version && <sup> {subApp.version}</sup>}
                    </span>
                  )}
                </div>
                {selectedItem.key === subApp.key && (
                  <div
                    className={`side-menu__indicator${
                      collapsed ? ' side-menu__indicator--collapsed' : ''
                    }`}
                  />
                )}
              </Menu.Item>
            );
          })}
        </Menu>
        <div className="side-menu__menu-extras-container">
          <div className="side-menu__bottom-item-wrapper">
            <div className="side-menu__bottom-item">
              {!collapsed && (
                <>
                  <span className="side-menu__footer-note">Powered by </span>
                  <a href="https://bluebrainnexus.io/" target="_blank">
                    <img
                      height="27px"
                      src={require('../images/logoDarkBg.svg')}
                    />
                  </a>
                </>
              )}
              <button
                className="side-menu__menu-collapse-button"
                onClick={onClickCollapse}
              >
                {collapsed ? <RightCircleOutlined /> : <LeftCircleOutlined />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Sider>
  );
};

export default SideMenu;
