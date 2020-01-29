import * as React from 'react';
import './TabList.less';
import { Tabs } from 'antd';
import TabElement from './TabElement';

const { TabPane } = Tabs;

type TabItem = {
  id: string;
  label: string;
  description: string;
};

type TabListProps = {
  items: TabItem[];
  onSelected: (activeKey: string) => void;
  defaultActiveId?: string;
  activeKey?: string;
  position?: 'left' | 'right' | 'top' | 'bottom' | undefined;
  onEditClick?: (id: string) => void;
  tabAction?: React.ReactElement;
  permissionsWrapper?: (child: React.ReactNode) => React.ReactNode;
};

const TabList: React.FunctionComponent<TabListProps> = ({
  items,
  onSelected,
  defaultActiveId,
  activeKey,
  position = 'left',
  children,
  onEditClick,
  tabAction,
  permissionsWrapper: resourcesWritePermissionsWrapper,
}) => {
  const editClick = onEditClick ? onEditClick : (id: string) => {};
  return (
    <div className="tab-list">
      <Tabs
        tabPosition={position}
        onChange={onSelected}
        defaultActiveKey={defaultActiveId}
        activeKey={activeKey}
        tabBarExtraContent={tabAction}
      >
        {items.map(({ label, description, id }) => (
          <TabPane
            tab={
              <TabElement
                label={label}
                description={description}
                id={id}
                onEditClick={editClick}
                permissionsWrapper={resourcesWritePermissionsWrapper}
              />
            }
            key={id}
          >
            {children}
          </TabPane>
        ))}
      </Tabs>
    </div>
  );
};

export default TabList;
