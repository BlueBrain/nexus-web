import * as React from 'react';
import { Collapse } from 'antd';

import ActionButton from './ActionButton';

const { Panel } = Collapse;

import './ResourcesPane.less';

const ResourcesPane: React.FC<{}> = ({ children }) => {
  const onClickLinkCode = (event: any) => {};

  const onClickAddNotes = (event: any) => {};

  return (
    <div className="resources-pane">
      <Collapse>
        <Panel
          header={
            <div className="resources-pane__header">
              <span className="resources-pane__pane-name">Resources</span>
              <ActionButton
                title="Link code"
                onClick={() => onClickLinkCode}
                icon="Add"
              />
              <ActionButton
                title="Add notes"
                onClick={() => onClickAddNotes}
                icon="Add"
              />
              <ActionButton
                title="Link or add data"
                onClick={() => {}}
                icon="Add"
              />
            </div>
          }
          key="1"
        >
          <div className="resources-pane__content">{children}</div>
        </Panel>
      </Collapse>
    </div>
  );
};

export default ResourcesPane;
