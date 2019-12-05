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
  position?: 'left' | 'right' | 'top' | 'bottom' | undefined;
  onEditClick? : ( id : string) => void 
};



const TabList: React.FunctionComponent<TabListProps> = ({
  items,
  onSelected,
  defaultActiveId,
  position = 'left',
  children,
  onEditClick
}) => {
  const editClick = onEditClick?  onEditClick :  ( id: string ) => {};
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
              <TabElement label={label} description={description} id={id} onEditClick={editClick}/>
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
