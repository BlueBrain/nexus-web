import React = require('react');
import { Link } from 'react-router-dom';

interface LinkProp {
  name: string;
  url: string;
}

interface HeaderProps {
  links: LinkProp[];
}

const Header: React.StatelessComponent<HeaderProps> = ({ links }) => (
  <ul>
    {links.map(link => <li key={link.url}>
      <Link
        to={link.url}
      >{link.name}</Link>
    </li>)}
  </ul>
);

export default Header;
