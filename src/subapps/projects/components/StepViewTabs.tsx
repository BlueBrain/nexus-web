import * as React from 'react';
import ActionButton from '../components/ActionButton';

import './StepViewTabs.less';

const TABS = ['Overview', 'Activities', 'Notes', 'Inputs'];

const StepViewTabs: React.FC<{
  onSelectTab: (tab: string) => void;
  activeTab?: string;
}> = ({ onSelectTab, activeTab }) => {
  return (
    <div className="step-view-tabs">
      <div>
        {TABS.map((tab: string) => (
          <ActionButton
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
