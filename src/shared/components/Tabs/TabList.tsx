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
  tabAction?: React.ReactElement;
  editButton?: (id: string) => React.ReactNode;
};

const TabList: React.FunctionComponent<TabListProps> = ({
  items,
  onSelected,
  defaultActiveId,
  activeKey,
  position = 'left',
  children,
  tabAction,
  editButton,
}) => {
  return (
    <div className="tab-list">
      <Tabs
        tabPosition={position}
        onChange={onSelected}
        defaultActiveKey={defaultActiveId}
        activeKey={activeKey}
        tabBarExtraContent={{ left: tabAction }}
      >
        {items.map(({ label, description, id }) => (
          <TabPane
            tab={
              <TabElement
                label={label}
                description={description}
                id={id}
                key={id}
                editButton={editButton}
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
