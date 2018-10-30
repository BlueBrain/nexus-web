import React = require('react');
import './Header.less';

export interface HeaderProps {
  links: React.ReactNode[];
}

const Header: React.StatelessComponent<HeaderProps> = ({ links }) => (
  <div className="Header">
    <ul>
      {links.map((link, i) => <li key={i}>{link}</li>)}
    </ul>
  </div>
);

export default Header;
