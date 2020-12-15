import * as React from 'react';
import ActionButton from '../components/ActionButton';

import './StepViewTabs.less';

export enum Tabs {
  OVERVIEW = 'Overview',
  ACTIVITIES = 'Activities',
  DESCRIPTION = 'Description',
  INPUTS = 'Inputs',
}

const tabs = Object.values(Tabs);

const StepViewTabs: React.FC<{
  onSelectTab: (tab: string) => void;
  activeTab?: string;
}> = ({ onSelectTab, activeTab }) => {
  return (
    <div className="step-view-tabs">
      <div>
        {tabs.map((tab: string) => (
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
