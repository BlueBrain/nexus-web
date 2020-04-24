import * as React from 'react';
import { Spin, Collapse, Button } from 'antd';
import { useHistory } from 'react-router-dom';
import { Resource } from '@bbp/nexus-sdk';
import { useNexusContext } from '@bbp/react-nexus';

import { StudioItem } from '../../views/StudioListView';

import './ExpandableStudioList.less';

const { Panel } = Collapse;

const StudioListItem: React.FC<{
  header: React.ReactNode;
  studio: StudioItem;
  key: string;
}> = ({ header, studio, ...props }) => {
  const nexus = useNexusContext();
  const [workspaces, setWorkspaces] = React.useState<Resource<any>[]>([]);

  React.useEffect(() => {
    if (studio && studio.workspaces) {
      Promise.all(
        studio.workspaces.map((workspaceId: string) =>
          nexus.Resource.get(
            studio.orgLabel,
            studio.projectLabel,
            encodeURIComponent(workspaceId)
          )
        )
      ).then((response: any) => {
        console.log('response', response);
        setWorkspaces(response);
      });
    }
  }, []);

  return (
    <Panel header={header} {...props}>
      <div className="workspace-list">
        <div>
          {workspaces && workspaces.length > 0 ? (
            workspaces.map(workspace => (
              <div>
                <h3 className="workspace-title">{workspace.label}</h3>
                <p>{workspace.description}</p>
              </div>
            ))
          ) : (
            <p>It looks like there are workspace in this project.</p>
          )}
        </div>
      </div>
    </Panel>
  );
};

const ExpandableStudioList: React.FC<{
  studios: StudioItem[];
  busy?: boolean;
  error?: Error | null;
  loadWorkspaces(studio: StudioItem): void;
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
        <Collapse onChange={() => {}}>
          {studios.map((studio, index) => {
            return (
              <StudioListItem
                studio={studio}
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
                      {/* <button className="more-button">More...</button> */}
                    </div>
                    {studioUrlButton(studio)}
                  </div>
                }
                key={`${index}`}
              />
            );
          })}
        </Collapse>
      </Spin>
    </div>
  );
};

export default ExpandableStudioList;
