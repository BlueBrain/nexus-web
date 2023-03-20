import React, { useState } from 'react'
import { Menu } from 'antd';
import * as SV from '../components/Settings';
import { ItemType } from 'antd/lib/menu/hooks/useItems';
import type { MenuProps } from 'antd'
import './SettingsContainer.less';
import { ProjectResponseCommon } from '@bbp/nexus-sdk';


type TMenuItem = ItemType & {
    id: string,
    component: (props: any) => JSX.Element
};
type OnSelectHandler = MenuProps['onSelect'];
type Props = {
    project?: Partial<Omit<ProjectResponseCommon, 'apiMappings'>>;
    apiMappings?: ProjectResponseCommon['apiMappings'];
    mode: string;
}

const subViewsMapper = new Map<string, TMenuItem>([
    ['general', {
        key: 'setting/general',
        id: 'setting/general',
        label: 'General',
        component: SV.GeneralSVComponent,
    }],
    ['apiMappings', {
        id: 'setting/apiMappings',
        key: 'setting/apiMappings',
        label: 'API Mappings',
        component: SV.APIMappinsSVComponent,
    }],
    ['views', {
        id: 'setting/views',
        key: 'setting/views',
        label: 'Views',
        component: SV.ViewsSVComponent,
    }],
    ['storages', {
        id: 'setting/storages',
        key: 'setting/storages',
        label: 'Storages',
        component: SV.StoragesSVComponent,
    }],
    ['quotas', {
        id: 'setting/quotas',
        key: 'setting/quotas',
        label: 'Quotas',
        component: SV.QuotasSVComponent,
    }],
    ['resolvers', {
        id: 'setting/resolvers',
        key: 'setting/resolvers',
        label: 'Resolvers',
        component: SV.ResolversSVComponent,
    }],
    ['permissionsAcls', {
        id: 'setting/permissionsAcls',
        key: 'setting/permissionsAcls',
        label: 'Permissions and ACLs',
        component: SV.PermissionsAclsSVComponent,
    }],
    ['dangerZone', {
        id: 'setting/dangerZone',
        key: 'setting/dangerZone',
        label: 'Danger Zone',
        component: SV.DangerZoneSVComponent,
    }],
]);

export default function SettingsContainer({ 
    project, 
    apiMappings, 
    mode
}: Props) {
    const menuItems = Array.from(subViewsMapper.entries()).map(([, value]) => value);
    const [selectedKey, setSelectedKey] = useState(menuItems[0].id);
    const handleOnSelectSubMenuItem: OnSelectHandler = ({ key }) => setSelectedKey(key);
    const subViewSelectedComponenet = (props: Props) => {
        const view = subViewsMapper.get(selectedKey.split('/')[1]);
        const Component = view!.component;
        const key = view!.key;
        return <Component key={key} { ...props } />;
    }

    return (
        <div className='settings-container'>
            <Menu 
                items={menuItems}
                defaultSelectedKeys={[menuItems[0].id]}
                defaultOpenKeys={[menuItems[0].id]}
                selectedKeys={[selectedKey]}
                onSelect={handleOnSelectSubMenuItem}
                multiple={false}
            />
            <div className='settings-content'>
                { subViewSelectedComponenet({ project, apiMappings, mode }) }
            </div>
        </div>
    )
}