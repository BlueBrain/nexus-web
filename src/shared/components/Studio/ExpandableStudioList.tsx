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

type StudioResource = Resource<{
  label: string;
  description?: string;
  workspaces: [string];
}>;

const StudioItem: React.FC<{
  studio: StudioItemProps;
}> = ({ studio }) => {
  const nexus = useNexusContext();
  const [workspaceIds, setWorkspaceIds] = React.useState<string[]>([]);

  const loadWorkspaces = async () => {
    await nexus.Resource.get('studios', 'Test', encodeURIComponent(studio.id))
      .then(response => {
        const studioResource: StudioResource = response as StudioResource;

        const workspaceIds: string[] = studioResource['workspaces'];
        setWorkspaceIds(workspaceIds);
      })
      .catch(error => console.log('error', error));
  };

  return (
    <div>
      {studio.description && (
        <p className="description">{studio.description}</p>
      )}
      {workspaceIds.length === 0 ? (
        <button className="more-button" onClick={() => loadWorkspaces()}>
          More...
        </button>
      ) : (
        <div>Coming soon...</div>
      )}
    </div>
  );
};

const ExpandableStudioList: React.FC<{
  studios: StudioItemProps[];
  busy?: boolean;
  error?: Error | null;
  goToStudio?(studioId: string): void;
  makeResourceUri(resourceId: string): string;
}> = ({ studios, busy, error, goToStudio = () => {}, makeResourceUri }) => {
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
                header={studio.name}
                key={index}
                extra={studioUrlButton(studio)}
              >
                <StudioItem studio={studio} />
              </Panel>
            );
          })}
        </Collapse>
      </Spin>
    </div>
  );
};

export default ExpandableStudioList;
