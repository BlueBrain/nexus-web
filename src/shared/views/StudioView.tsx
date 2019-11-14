import * as React from 'react';
import { match } from 'react-router';
import { useAsyncEffect } from 'use-async-effect';
import { Resource } from '@bbp/nexus-sdk';
import { useNexusContext } from '@bbp/react-nexus';
import StudioContainer from '../containers/StudioContainer';

type StudioViewProps = {
  match: match<{ orgLabel: string; projectLabel: string; studioId: string }>;
};

const StudioView: React.FunctionComponent<StudioViewProps> = props => {
  const { match } = props;
  const nexus = useNexusContext();
  const {
    params: { orgLabel, projectLabel, studioId },
  } = match;

  return (
    <StudioContainer
      orgLabel={orgLabel}
      projectLabel={projectLabel}
      studioId={studioId}
    />
  );
};

export default StudioView;
