import * as React from 'react';
import { Resource } from '@bbp/nexus-sdk';
import { useNexusContext } from '@bbp/react-nexus';

import StudioWorkspaceList from '../components/Studio/StudioWorkspaceList';
import { StudioItem } from '../views/StudioListView';

const WorkspaceMiniListContainer: React.FC<{ studio: StudioItem }> = ({
  studio,
}) => {
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
        setWorkspaces(response);
      });
    }
  }, []);

  return <StudioWorkspaceList workspaces={workspaces} />;
};

export default WorkspaceMiniListContainer;
