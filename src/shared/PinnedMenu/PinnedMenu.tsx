import React from 'react'
import { Link } from 'react-router-dom';
import { SearchOutlined, FolderOutlined, WalletOutlined, } from '@ant-design/icons';
import './styles.less';

type Props = {}
type TMenuItem = {
    id: string;
    title: string;
    url: string;
    bg: string;
    icon: React.ReactElement;
}
const ICON_SIZE = 16;
const Menu = new Map<string, TMenuItem>([
    ['search', {
        id: 'pinned-menu/search',
        title: 'Search',
        url: '/search',
        bg: '#003A8C',
        icon: <SearchOutlined style={{ fontSize: ICON_SIZE, color: 'white' }} />,
    }],
    ['organizations', {
        id: 'pinned-menu/organizations',
        title: 'Organizations',
        url: '/orgs',
        bg: '#0050B3',
        icon: <FolderOutlined style={{ fontSize: ICON_SIZE, color: 'white' }} />,
    }],
    ['projects', {
        id: 'pinned-menu/projects',
        title: 'Projects',
        url: '/projects',
        bg: '#096DD9',
        icon: <WalletOutlined style={{ fontSize: ICON_SIZE, color: 'white' }} />,
    }],
]);
const PinnedItem: React.FC<TMenuItem> = ({ title, url, icon, bg }) => {
    return (
        <Link 
            to={url} 
            title={title} 
            className='pinned-item' 
            style={{ backgroundColor: bg }}
        >
            {icon}
        </Link>
    )
}
export default function PinnedMenu({ }: Props) {
    return (
        <div className='pinned-menu'>
            {
                Array.from(Menu).map(([_, item]) => <PinnedItem key={item.id} {...item} />)
            }
        </div>
    )
}