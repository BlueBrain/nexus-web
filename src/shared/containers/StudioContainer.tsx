import * as React from 'react';
import { useAsyncEffect } from 'use-async-effect';
import { Resource } from '@bbp/nexus-sdk';
import { useNexusContext } from '@bbp/react-nexus';
import WorkspaceList from './WorkspaceList';

type StudioContainerProps = {
  orgLabel: string;
  projectLabel: string;
  studioId: string;
};

const StudioContainer: React.FunctionComponent<StudioContainerProps> = ({
  orgLabel,
  projectLabel,
  studioId,
}) => {
  const [isStudio, setIsStudio] = React.useState<boolean>(false);
  const [workSpaceIds, setWorkspaceIds] = React.useState<string[]>([]);
  const nexus = useNexusContext();
  useAsyncEffect(async () => {
    const activeResource = (await nexus.Resource.get(
      orgLabel,
      projectLabel,
      studioId
    )) as Resource;
    if (activeResource['@type'] === 'Studio') {
      setIsStudio(true);
    }
    const workspaceIds: string[] = activeResource['workspaces'];
    setWorkspaceIds(workspaceIds);
  }, [orgLabel, projectLabel, studioId]);
  return (
    <>
      {isStudio ? (
        <div className="studio-view">
          <WorkspaceList
            orgLabel={orgLabel}
            projectLabel={projectLabel}
            workSpaceIds={workSpaceIds}
          />
        </div>
      ) : (
        <h4>'The Resource is not a Studio'</h4>
      )}
    </>
  );
};

export default StudioContainer;
