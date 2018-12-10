import * as React from 'react';
import { Menu, Dropdown, Icon } from 'antd';
import './Header.less';

const logo = require('../../logo.svg');

export interface HeaderProps {
  name?: string;
  links?: React.ReactNode[];
  displayLogin?: boolean;
  children?: React.ReactChild;
  onLoginClick?(): void;
}

const Header: React.FunctionComponent<HeaderProps> = ({
  name = '',
  displayLogin = true,
  links = [],
  children,
  onLoginClick,
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
      <div className="logo-block">
        <a className="logo" href="">
          {/* inline styling to prevent headaches in dev mode */}
          <img src={logo} alt="Nexus" style={{ height: '2em', width: '2em' }} />
        </a>
        <h1>Nexus</h1>
      </div>
      <div className="selectors">{children}</div>
      <div className="menu-block">
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
