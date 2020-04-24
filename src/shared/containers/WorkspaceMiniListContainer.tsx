import * as React from 'react';
import { Resource } from '@bbp/nexus-sdk';
import { useNexusContext } from '@bbp/react-nexus';

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
        console.log('response', response);
        setWorkspaces(response);
      });
    }
  }, []);
  return (
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
  );
};

export default WorkspaceMiniListContainer;
