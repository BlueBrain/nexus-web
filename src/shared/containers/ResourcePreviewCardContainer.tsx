import * as React from 'react';
import { useAsyncEffect } from 'use-async-effect';
import { useNexusContext } from '@bbp/react-nexus';
import { Resource, ResourceLink, NexusFile } from '@bbp/nexus-sdk';

import ResourcePreviewCard from '../components/Graph/ResourcePreviewCard';

const ResourcePreviewCardContainer: React.FunctionComponent<{
    resourceId: string,
    projectLabel: string,
    orgLabel: string,
}> = ({ resourceId, projectLabel, orgLabel }) => {
    const nexus = useNexusContext();
    const [{ busy, resource, error }, setResource] = React.useState<{
        busy: boolean;
        resource: Resource | null;
        error: Error | null;
      }>({
        busy: false,
        resource: null,
        error: null,
      });

    useAsyncEffect(async () => {
        try {
          setResource({
            resource,
            error: null,
            busy: true,
          });
          const nextResource = (await nexus.Resource.get(
            orgLabel,
            projectLabel,
            resourceId
          )) as Resource;
          setResource({
            resource: nextResource,
            error: null,
            busy: true,
          });
        } catch (error) {
          setResource({
            error,
            resource,
            busy: false,
          });
        }
      }, [orgLabel, projectLabel, resourceId]);
    
  return (
    <ResourcePreviewCard />
  );
}

export default ResourcePreviewCardContainer;