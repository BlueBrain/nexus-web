import * as React from 'react';
import ActionButton from '../components/ActionButton';

import './StepViewTabs.less';

export enum Tabs {
  OVERVIEW = 'Overview',
  ACTIVITIES = 'Activities',
  DESCRIPTION = 'Description',
  INPUTS = 'Inputs',
}

const StepViewTabs: React.FC<{
  onSelectTab: (tab: string) => void;
  activeTab?: string;
  tabs?: Tabs[];
}> = ({ onSelectTab, activeTab, tabs }) => {
  // console.log('======');
  // console.log(tabs);
  // console.log('======');
  const availableTabs = tabs ? tabs : Object.values(Tabs);
  return (
    <div className="step-view-tabs">
      <div>
        {availableTabs.map((tab: string) => (
          <ActionButton
            key={tab}
            highlighted={activeTab === tab}
            title={tab}
            onClick={() => onSelectTab(tab)}
          />
        ))}
      </div>
    </div>
  );
};

export default StepViewTabs;
