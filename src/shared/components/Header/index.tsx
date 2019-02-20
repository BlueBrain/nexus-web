import * as React from 'react';
import { Menu, Dropdown, Icon, Button } from 'antd';
import './Header.less';
import Copy from '../Copy';

const logo = require('../../logo.svg');

export interface HeaderProps {
  name?: string;
  token?: string;
  links?: React.ReactNode[];
  displayLogin?: boolean;
  children?: React.ReactChild;
  onLoginClick?(): void;
}

const Header: React.FunctionComponent<HeaderProps> = ({
  name = '',
  token,
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
      <div className="selectors">{children}</div>
      <div className="logo-block">
        <a className="logo" href="">
          <img src={logo} alt="Nexus" />
          <h1>Nexus</h1>
        </a>
      </div>
      <div className="menu-block">
        {token && (
          <Copy
            textToCopy={token}
            render={(copySuccess, triggerCopy) => (
              <Button size="small" icon="copy" onClick={() => triggerCopy()}>
                {copySuccess ? 'Copied!' : 'Token'}
              </Button>
            )}
          />
        )}
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
