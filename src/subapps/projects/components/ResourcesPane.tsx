import * as React from 'react';
import { Collapse, Modal } from 'antd';
import ResizeObserver from 'resize-observer-polyfill';

import ActionButton from './ActionButton';
import LinkCodeForm from './LinkCodeForm';

const { Panel } = Collapse;

import './ResourcesPane.less';

const ResourcesPane: React.FC<{}> = ({ children }) => {
  const paneRef = React.useRef<HTMLDivElement>(null);
  const [paneWidth, setPaneWidth] = React.useState<number>();
  const [showCodeForm, setShowCodeForm] = React.useState<boolean>(false);

  const resizeObserver = new ResizeObserver(entries => {
    const width = entries[0].contentRect.width;

    setPaneWidth(width);
  });

  React.useEffect(() => {
    if (paneRef && paneRef.current) {
      resizeObserver.observe(paneRef.current.parentElement as HTMLDivElement);
    }

    return () => {
      if (paneRef && paneRef.current) {
        resizeObserver.unobserve(
          paneRef.current.parentElement as HTMLDivElement
        );
      }

      resizeObserver.disconnect();
    };
  }, []);

  const onClickAddNotes = () => {};

  return (
    <>
      <div
        ref={paneRef}
        className="resources-pane"
        style={{ width: `${paneWidth}px` }}
      >
        <Collapse>
          <Panel
            header={
              <div className="resources-pane__header">
                <span className="resources-pane__pane-name">Resources</span>
                <ActionButton
                  title="Link code"
                  onClick={() => setShowCodeForm(true)}
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
      <Modal
        visible={showCodeForm}
        footer={null}
        onCancel={() => setShowCodeForm(false)}
        width={1150}
        destroyOnClose={true}
      >
        <LinkCodeForm
          onClickCancel={() => setShowCodeForm(false)}
          onClickSubmit={() => {}}
        />
      </Modal>
    </>
  );
};

export default ResourcesPane;
