import React, { useState } from 'react';
import { ProjectResponseCommon } from '@bbp/nexus-sdk';
import { Menu, MenuProps } from 'antd';

import * as SV from '../components/Settings';
import './SettingsContainer.less';

type Props = {
  project?: Partial<Omit<ProjectResponseCommon, 'apiMappings'>>;
  apiMappings?: ProjectResponseCommon['apiMappings'];
  mode: string;
};

type TMenuItem = {
  key: React.Key;
  id: string;
  label: string;
  Component: (props: any) => JSX.Element;
};
type OnSelectHandler = MenuProps['onSelect'];

const subViewsMapper = new Map<string, TMenuItem>([
  [
    'general',
    {
      id: 'setting/general',
      key: 'setting/general',
      label: 'General',
      Component: SV.GeneralSVComponent,
    },
  ],
  [
    'apiMappings',
    {
      id: 'setting/apiMappings',
      key: 'setting/apiMappings',
      label: 'API Mappings',
      Component: SV.APIMappinsSVComponent,
    },
  ],
  [
    'views',
    {
      id: 'setting/views',
      key: 'setting/views',
      label: 'Views',
      Component: SV.ViewsSVComponent,
    },
  ],
  [
    'storages',
    {
      id: 'setting/storages',
      key: 'setting/storages',
      label: 'Storages',
      Component: SV.StoragesSVComponent,
    },
  ],
  [
    'quotas',
    {
      id: 'setting/quotas',
      key: 'setting/quotas',
      label: 'Quotas',
      Component: SV.QuotasSVComponent,
    },
  ],
  [
    'resolvers',
    {
      id: 'setting/resolvers',
      key: 'setting/resolvers',
      label: 'Resolvers',
      Component: SV.ResolversSVComponent,
    },
  ],
  [
    'permissionsAcls',
    {
      id: 'setting/permissionsAcls',
      key: 'setting/permissionsAcls',
      label: 'Permissions and ACLs',
      Component: SV.PermissionsAclsSVComponent,
    },
  ],
  [
    'dangerZone',
    {
      id: 'setting/dangerZone',
      key: 'setting/dangerZone',
      label: 'Danger Zone',
      Component: SV.DangerZoneSVComponent,
    },
  ],
]);

const SettingsContainer: React.FunctionComponent<Props> = ({
  project,
  apiMappings,
  mode,
}) => {
  const menuItems = Array.from(subViewsMapper.entries()).map(
    ([, value]) => value
  );
  const [selectedKey, setSelectedKey] = useState(menuItems[0].id);
  //@ts-ignore
  const handleOnSelectSubMenuItem: OnSelectHandler = (info) => setSelectedKey(info.key);
  const subViewSelectedComponenet = (props: Props) => {
    const view = subViewsMapper.get(selectedKey.split('/')[1]);
    const Component = view!.Component;
    const key = view!.key;
    return <Component key={key} {...props} />;
  };

  return (
    <div className="settings-container">
      <Menu
        defaultSelectedKeys={[menuItems[0].id]}
        defaultOpenKeys={[menuItems[0].id]}
        selectedKeys={[selectedKey]}
        onSelect={handleOnSelectSubMenuItem}
        multiple={false}
      >
        { menuItems.map(item => (
          <Menu.Item key={item.key}>{item.label}</Menu.Item>
        )) }
      </Menu>
      <div className="settings-content">
        {subViewSelectedComponenet({ project, apiMappings, mode })}
      </div>
    </div>
  );
};

export default SettingsContainer;
