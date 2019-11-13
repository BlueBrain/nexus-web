import * as React from 'react';
import { useAsyncEffect } from 'use-async-effect';
import { useNexusContext } from '@bbp/react-nexus';
import { Resource, ResourceLink, NexusFile } from '@bbp/nexus-sdk';

import ResourcePreviewCard from '../components/Graph/ResourcePreviewCard';

const ResourcePreviewCardContainer: React.FunctionComponent<{
    orgLabel: string,
    projectLabel: string,
    resourceId: string,
}> = ({ orgLabel, projectLabel, resourceId }) => {
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
            encodeURIComponent(resourceId)
          )) as Resource;
          setResource({
            resource: nextResource,
            error: null,
            busy: true,
          });

        //   console.log('resource', nextResource);
          
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