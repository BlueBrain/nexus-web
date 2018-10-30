import React = require('react');
import logo from './logo.svg';
import './Header.less';

export interface HeaderProps {
  links: React.ReactNode[];
}

console.log(logo);

const Header: React.StatelessComponent<HeaderProps> = ({ links }) => (
  <div className="Header">
    <img src={logo} className="logo" alt="Nexus" />
    <ul>
      {links.map((link, i) => <li key={i}>{link}</li>)}
    </ul>
  </div>
);

export default Header;
