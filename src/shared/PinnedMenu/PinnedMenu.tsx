import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  SearchOutlined,
  FolderOutlined,
  WalletOutlined,
  HomeOutlined,
} from '@ant-design/icons';
import { RootState } from '../../shared/store/reducers';
import './styles.scss';

type Props = {};
type TMenuItem = {
  id: string;
  title: string;
  url: string;
  bg: string;
  icon: React.ReactElement;
};
const ICON_SIZE = 16;
const Menu = new Map<string, TMenuItem>([
  [
    'home',
    {
      id: 'pinned-menu/home',
      title: 'Search',
      url: '/',
      bg: '#002766',
      icon: <HomeOutlined style={{ fontSize: ICON_SIZE, color: 'white' }} />,
    },
  ],
  [
    'search',
    {
      id: 'pinned-menu/search',
      title: 'Search',
      url: '/search',
      bg: '#003a8c',
      icon: <SearchOutlined style={{ fontSize: ICON_SIZE, color: 'white' }} />,
    },
  ],
  [
    'organizations',
    {
      id: 'pinned-menu/organizations',
      title: 'Organizations',
      url: '/orgs',
      bg: '#0050B3',
      icon: <FolderOutlined style={{ fontSize: ICON_SIZE, color: 'white' }} />,
    },
  ],
  [
    'projects',
    {
      id: 'pinned-menu/projects',
      title: 'Projects',
      url: '/projects',
      bg: '#096DD9',
      icon: <WalletOutlined style={{ fontSize: ICON_SIZE, color: 'white' }} />,
    },
  ],
]);
const PinnedItem: React.FC<TMenuItem> = ({ title, url, icon, bg }) => {
  return (
    <Link
      to={url}
      title={title}
      className="pinned-item"
      style={{ backgroundColor: bg }}
    >
      {icon}
    </Link>
  );
};
const PinnedMenu: React.FC<Props> = ({}) => {
  const oidc = useSelector((state: RootState) => state.oidc);
  const authenticated = !!oidc.user;
  const token = oidc.user && oidc.user.access_token;
  const userAuthenticated = Boolean(authenticated) && Boolean(token);
  return userAuthenticated ? (
    <div className="pinned-menu">
      {Array.from(Menu).map(([_, item]) => (
        <PinnedItem key={item.id} {...item} />
      ))}
    </div>
  ) : null;
};

export default PinnedMenu;
