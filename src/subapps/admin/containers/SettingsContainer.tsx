import { ProjectResponseCommon } from '@bbp/nexus-sdk';
import { Menu, MenuProps } from 'antd';
import * as React from 'react';
import DangerZoneSVComponent from '../components/Settings/DangerZoneSubView';
import GeneralSVComponent from '../components/Settings/GeneralSubView';
import PermissionsAclsSVComponent from '../components/Settings/PermissionsAclsSubView';
import ResolversSVComponent from '../components/Settings/ResolversSubView';
import StoragesSVComponent from '../components/Settings/StoragesSubView';
import ViewsSVComponent from '../components/Settings/ViewsSubView';
import './SettingsContainer.less';
import { useState } from 'react';

type Props = {
  project?: Partial<Omit<ProjectResponseCommon, 'apiMappings'>>;
  apiMappings?: ProjectResponseCommon['apiMappings'];
  mode: string;
  projectDeprecated: boolean;
  setProjectDeprecated: (deprecated: boolean) => void;
};

type TMenuItem = {
  key: string;
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
      Component: GeneralSVComponent,
    },
  ],
  [
    'views',
    {
      id: 'setting/views',
      key: 'setting/views',
      label: 'Views',
      Component: ViewsSVComponent,
    },
  ],
  [
    'storages',
    {
      id: 'setting/storages',
      key: 'setting/storages',
      label: 'Storages',
      Component: StoragesSVComponent,
    },
  ],
  [
    'resolvers',
    {
      id: 'setting/resolvers',
      key: 'setting/resolvers',
      label: 'Resolvers',
      Component: ResolversSVComponent,
    },
  ],
  [
    'permissionsAcls',
    {
      id: 'setting/permissionsAcls',
      key: 'setting/permissionsAcls',
      label: 'Permissions and ACLs',
      Component: PermissionsAclsSVComponent,
    },
  ],
  [
    'dangerZone',
    {
      id: 'setting/dangerZone',
      key: 'setting/dangerZone',
      label: 'Danger Zone',
      Component: DangerZoneSVComponent,
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
  const [selectedKey, setSelectedKey] = useState(() => menuItems[0].id);
  const [projectDeprecated, setProjectDeprecated] = useState(
    project?._deprecated ?? false
  );

  const handleOnSelectSubMenuItem: OnSelectHandler = info =>
    setSelectedKey(info.key);
  const subViewSelectedComponent = (props: Props) => {
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
        {menuItems.map(item => (
          <Menu.Item key={item.key}>{item.label}</Menu.Item>
        ))}
      </Menu>
      <div className="settings-content">
        {subViewSelectedComponent({
          project,
          apiMappings,
          mode,
          projectDeprecated,
          setProjectDeprecated,
        })}
      </div>
    </div>
  );
};

export default SettingsContainer;
