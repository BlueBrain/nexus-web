import React = require('react');
import './Header.less';

const logo = require('../../logo.svg');

export interface HeaderProps {
  links: React.ReactNode[];
}

const Header: React.StatelessComponent<HeaderProps> = ({ links }) => (
  <div className="Header">
    <img src={logo} className="logo" alt="Nexus" />
    <ul>
      {links.map((link, i) => <li key={i}>{link}</li>)}
    </ul>
  </div>
);

export default Header;
