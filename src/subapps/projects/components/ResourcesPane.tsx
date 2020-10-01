import * as React from 'react';
import { Collapse } from 'antd';

import ActionButton from '../components/ActionButton';

const { Panel } = Collapse;

import './ResourcesPane.less';

const ResourcesPane: React.FC<{}> = () => {
  return (
    <div className="resources-pane">
      <Collapse>
        <Panel
          header={
            <div className="resources-pane__header">
              <span className="resources-pane__pane-name">Resources</span>
              <ActionButton title="Link code" onClick={() => {}} icon="Add" />
              <ActionButton title="Add notes" onClick={() => {}} icon="Add" />
              <ActionButton
                title="Link or add data"
                onClick={() => {}}
                icon="Add"
              />
            </div>
          }
          key="1"
        >
          <h2>Resources</h2>
        </Panel>
      </Collapse>
    </div>
  );
};

export default ResourcesPane;
