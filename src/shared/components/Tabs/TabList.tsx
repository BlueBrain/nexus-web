import * as React from 'react';
import './TabList.less';
import { Tabs } from 'antd';

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
  position?: 'left' | 'right' | 'top' | 'bottom' | undefined;
};

const TabList: React.FunctionComponent<TabListProps> = ({
  items,
  onSelected,
  defaultActiveId,
  position = 'left',
  children,
}) => {
  return (
    <div className="tab-list">
      <Tabs
        tabPosition={position}
        onChange={onSelected}
        defaultActiveKey={defaultActiveId}
      >
        {items.map(({ label, description, id }) => (
          <TabPane
            tab={
              <div className="tab-item">
                <span className="title ellipsis">{label}</span>
                <p className="description fade">{description}</p>
              </div>
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
