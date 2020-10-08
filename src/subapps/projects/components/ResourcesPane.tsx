import * as React from 'react';
import { Collapse } from 'antd';
import ResizeObserver from 'resize-observer-polyfill';

import ActionButton from './ActionButton';

const { Panel } = Collapse;

import './ResourcesPane.less';

const ResourcesPane: React.FC<{}> = ({ children }) => {
  const [paneWidth, setPaneWidth] = React.useState<number>();

  React.useEffect(() => {
    const parentDiv = document.getElementsByClassName('activity-view')[0];
    const parentWidth = (parentDiv as HTMLElement).offsetWidth;

    setPaneWidth(parentWidth);

    const resizeObserver = new ResizeObserver(entries => {
      const width = entries[0].contentRect.width;

      setPaneWidth(width);
    });

    resizeObserver.observe(parentDiv);

    return () => {
      resizeObserver.unobserve(parentDiv);
    };
  }, []);

  const onClickLinkCode = (event: any) => {};

  const onClickAddNotes = (event: any) => {};

  return (
    <div className="resources-pane" style={{ width: `${paneWidth}px` }}>
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
