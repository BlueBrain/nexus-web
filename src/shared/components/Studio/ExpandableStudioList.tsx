import * as React from 'react';
import { Spin, Collapse, Button } from 'antd';
import { Resource } from '@bbp/nexus-sdk';
import { useNexusContext } from '@bbp/react-nexus';

import './ExpandableStudioList.less';

const { Panel } = Collapse;

type StudioItemProps = {
  id: string;
  name: string;
  description?: string;
};

const ExpandableStudioList: React.FC<{
  studios: StudioItemProps[];
  busy?: boolean;
  error?: Error | null;
  goToStudio?(studioId: string): void;
  makeResourceUri(resourceId: string): string;
  loadWorkspaces(studioId: string): void;
}> = ({
  studios,
  busy,
  error,
  goToStudio = () => {},
  makeResourceUri,
  loadWorkspaces,
}) => {
  const studioUrlButton = (studio: StudioItemProps) => (
    <a
      href={makeResourceUri(studio.id)}
      key={studio.id}
      onClick={e => {
        e.preventDefault();
        goToStudio(studio.id);
      }}
    >
      <Button type="default" size="small">
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
                      <p>{studio.name}</p>
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
                  Here should appear a workspace list...
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
