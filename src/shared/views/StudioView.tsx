import * as React from 'react';
import { match } from 'react-router';
import { useAsyncEffect } from 'use-async-effect';
import { Resource } from '@bbp/nexus-sdk';
import { useNexusContext } from '@bbp/react-nexus';
import WorkSpaceList from '../containers/WorkSpaceList';

interface StudioViewProps {
  match: match<{ orgLabel: string; projectLabel: string; studioId: string }>;
}

const StudioView: React.FunctionComponent<StudioViewProps> = props => {
  const { match } = props;
  const [isStudio, setIsStudio] = React.useState<boolean>(false);
  const [workSpaceIds, setWorkSpaceIds] = React.useState<string[]>([]);
  const nexus = useNexusContext();
  const {
    params: { orgLabel, projectLabel, studioId },
  } = match;

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
    setWorkSpaceIds(workspaceIds);
  }, [studioId]);
  return (
    <h4>
      {' '}
      {isStudio ? (
        <div className="studio-view">
          <WorkSpaceList
            orgLabel={orgLabel}
            projectLabel={projectLabel}
            workSpaceIds={workSpaceIds}
          />{' '}
        </div>
      ) : (
        'The Resource is not a Studio'
      )}
    </h4>
  );
};

export default StudioView;
