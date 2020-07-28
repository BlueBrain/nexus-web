import * as React from 'react';
import { Collapse } from 'antd';

import WorkspaceMiniListContainer from '../containers/WorkspaceMiniListContainer';
import { StudioItem } from '../views/StudioListView';

const { Panel } = Collapse;

const StudioListItem: React.FC<{
  header: React.ReactNode;
  studio: StudioItem;
  key: string;
}> = ({ header, studio, ...props }) => {
  return (
    <Panel header={header} {...props}>
      <div className="workspace-list">
        <WorkspaceMiniListContainer studio={studio} />
      </div>
    </Panel>
  );
};

export default StudioListItem;
