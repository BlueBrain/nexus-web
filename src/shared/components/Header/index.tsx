import React = require('react');
import { Menu, Dropdown, Icon } from 'antd';
import './Header.less';

const logo = require('../../logo.svg');

export interface HeaderProps {
  name: string;
  links: React.ReactNode[];
}

const Header: React.StatelessComponent<HeaderProps> = ({ name, links }) => {
  const menu = (
    <Menu>
      {links.map((link, i) => <Menu.Item key={i}>{link}</Menu.Item>)}
    </Menu>
  );

  return (
    <header className="Header">
      <div className="logo-block">
        <a className="logo" href="">
          <img src={logo} alt="Nexus" />
        </a>
        <h1>Nexus</h1>
      </div>
      <div className="menu-block">
        <Dropdown overlay={menu}>
          <a className="menu-dropdown ant-dropdown-link">
            {name} <Icon type="down" />
          </a>
        </Dropdown>
      </div>
    </header>
  );
};

export default Header;
