import * as React from 'react';
import { Resource } from '@bbp/nexus-sdk';
import { useNexusContext } from '@bbp/react-nexus';
import { Spin, Empty } from 'antd';

import StudioWorkspaceList from '../components/Studio/StudioWorkspaceList';
import { StudioItem } from '../views/StudioListView';

const WorkspaceMiniListContainer: React.FC<{ studio: StudioItem }> = ({
  studio,
}) => {
  const nexus = useNexusContext();
  const [{ workspaces, busy, error }, setWorkspaces] = React.useState<{
    workspaces: Resource<any>[];
    busy: boolean;
    error: Error | null;
  }>({ workspaces: [], busy: true, error: null });

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
      )
        .then((response: any) => {
          setWorkspaces({
            workspaces: response,
            busy: false,
            error: null,
          });
        })
        .catch(error =>
          setWorkspaces({
            workspaces: [],
            busy: false,
            error,
          })
        );
    }
  }, []);

  if (error) {
    return <Empty description={error.message} />;
  }

  return (
    <Spin spinning={busy}>
      <StudioWorkspaceList workspaces={workspaces} studio={studio} />
    </Spin>
  );
};

export default WorkspaceMiniListContainer;
