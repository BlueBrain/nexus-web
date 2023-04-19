import * as React from 'react';
import { ProjectResponseCommon } from '@bbp/nexus-sdk';
import { Menu, MenuProps } from 'antd';
import GeneralSVComponent from '../components/Settings/GeneralSubView';
import ViewsSVComponent from '../components/Settings/ViewsSubView';
import StoragesSVComponent from '../components/Settings/StoragesSubView';
import ResolversSVComponent from '../components/Settings/ResolversSubView';
import PermissionsAclsSVComponent from '../components/Settings/PermissionsAclsSubView';
import DangerZoneSVComponent from '../components/Settings/DangerZoneSubView';
import './SettingsContainer.less';

type Props = {
  project?: Partial<Omit<ProjectResponseCommon, 'apiMappings'>>;
  apiMappings?: ProjectResponseCommon['apiMappings'];
  mode: string;
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
  // [
  //   'quotas',
  //   {
  //     id: 'setting/quotas',
  //     key: 'setting/quotas',
  //     label: 'Quotas',
  //     Component: QuotasSVComponent,
  //   },
  // ],
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
// @ts-ignore

const SettingsContainer: React.FunctionComponent<Props> = ({
  project,
  apiMappings,
  mode,
}) => {
  // const menuItems = Object.entries(subViewsMapper).map(([key, value]) => value);
  const menuItems = Array.from(subViewsMapper.entries()).map(
    ([, value]) => value
  );
  const [selectedKey, setSelectedKey] = React.useState(() => menuItems[0].id);
  // @ts-ignore
  const handleOnSelectSubMenuItem: OnSelectHandler = info =>
    setSelectedKey(info.key);
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
        {menuItems.map(item => (
          <Menu.Item key={item.key}>{item.label}</Menu.Item>
        ))}
      </Menu>
      <div className="settings-content">
        {subViewSelectedComponenet({ project, apiMappings, mode })}
      </div>
    </div>
  );
};

export default SettingsContainer;
