import * as React from 'react';
import { Collapse, Modal } from 'antd';
import ResizeObserver from 'resize-observer-polyfill';

import ActionButton from './ActionButton';
import LinkCodeForm, { CodeResourceData } from './LinkCodeForm';

const { Panel } = Collapse;

import './ResourcesPane.less';

const ResourcesPane: React.FC<{
  linkCode(data: CodeResourceData): void;
  onTabSelect(tabName: string): void;
  activeTab: string;
}> = ({ children, linkCode, onTabSelect }) => {
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

  // TODO: link notes
  const onClickAddNotes = () => {};

  const onClickSave = (data: CodeResourceData) => {
    linkCode(data);
    setShowCodeForm(false);
  };

  const onClickAddCode = () => setShowCodeForm(true);

  return (
    <>
      <div
        ref={paneRef}
        className="resources-pane"
        style={{ width: `${paneWidth}px` }}
      >
        <Collapse defaultActiveKey={['1']}>
          <Panel
            header={
              <div className="resources-pane__header">
                <span className="resources-pane__pane-name">Details</span>
                <ActionButton
                  title="Activities"
                  onClick={() => onTabSelect('Activities')}
                />
                <ActionButton
                  title="Notes"
                  onClick={() => onTabSelect('Notes')}
                />
                <ActionButton
                  title="Inputs"
                  onClick={() => onTabSelect('Inputs')}
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
        width={600}
        destroyOnClose={true}
      >
        <LinkCodeForm
          onClickCancel={() => setShowCodeForm(false)}
          onSubmit={onClickSave}
        />
      </Modal>
    </>
  );
};

export default ResourcesPane;
