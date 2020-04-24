import * as React from 'react';
import { Spin, Collapse, Button } from 'antd';
import { useHistory } from 'react-router-dom';
import { StudioItem } from '../../views/StudioListView';

import './ExpandableStudioList.less';

const { Panel } = Collapse;

const ExpandableStudioList: React.FC<{
  studios: StudioItem[];
  busy?: boolean;
  error?: Error | null;
  loadWorkspaces(studioId: string): void;
}> = ({ studios, busy, error, loadWorkspaces }) => {
  const history = useHistory();

  const makeStudioUri = (studio: StudioItem) => {
    const { orgLabel, projectLabel } = studio;

    return `/${orgLabel}/${projectLabel}/studios/${encodeURIComponent(
      studio.id
    )}`;
  };

  const goToStudio = (studio: StudioItem) => {
    history.push(makeStudioUri(studio));
  };

  const studioUrlButton = (studio: StudioItem) => (
    <a
      href={makeStudioUri(studio)}
      key={studio.id}
      onClick={e => {
        e.preventDefault();
        goToStudio(studio);
      }}
    >
      <Button type="primary" size="small">
        Go to Studio
      </Button>
    </a>
  );

  return (
    <div className="expandable-studio-list">
      <Spin spinning={busy}>
        <Collapse defaultActiveKey={['0']} onChange={() => {}}>
          {studios.map((studio, index) => {
            return (
              <Panel
                header={
                  <div className="studio-title-panel">
                    <div>
                      <a
                        href={makeStudioUri(studio)}
                        key={studio.id}
                        onClick={e => {
                          e.preventDefault();
                          goToStudio(studio);
                        }}
                      >
                        <h3 className="studio-name">{studio.label}</h3>
                      </a>
                      <p>{studio.description}</p>
                      <button
                        className="more-button"
                        onClick={() => loadWorkspaces(studio.id)}
                      >
                        More...
                      </button>
                    </div>
                    {studioUrlButton(studio)}
                  </div>
                }
                key={index}
              >
                <div className="workspace-list">
                  <h3>Workspaces</h3>
                </div>
              </Panel>
            );
          })}
        </Collapse>
      </Spin>
    </div>
  );
};

export default ExpandableStudioList;
