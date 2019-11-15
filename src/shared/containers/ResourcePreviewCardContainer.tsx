import * as React from 'react';
import { useAsyncEffect } from 'use-async-effect';
import { useNexusContext } from '@bbp/react-nexus';
import { Resource } from '@bbp/nexus-sdk';

import ResourceCard from '../components/ResourceCard';
import ResourceCardCollapsed from '../components/ResourceCard/ResourceCardCollapsed';
import ResourcePreviewCard from '../components/ResourceCard/ResourcePreviewCard';

const ResourcePreviewCardContainer: React.FunctionComponent<{
    orgLabel: string,
    projectLabel: string,
    resourceId: string,
    isExternal: boolean | null,
}> = ({ orgLabel, projectLabel, resourceId, isExternal }) => {
    const nexus = useNexusContext();
    const [showFullCard, setShowFullCard] = React.useState(false);
    const [{ busy, resource, error }, setResource] = React.useState<{
        busy: boolean;
        resource: Resource | null;
        error: Error | null;
      }>({
        busy: false,
        resource: null,
        error: null,
      });

    useAsyncEffect(async isMounted => {
      if (!isMounted()) {
        return;
      }

      if (isExternal) {
        setResource({
          resource: null,
          error: null,
          busy: false,
        });
        return;
      }

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
          busy: false,
        });
      } catch (error) {
        setResource({
          error,
          resource,
          busy: false,
        });
      }
    }, [orgLabel, projectLabel, resourceId]);

  if (isExternal) {
    return (
      <ResourcePreviewCard>
        <ResourceCardCollapsed resourceId={resourceId} busy={busy} isExternal />
      </ResourcePreviewCard>
    )
  }
  
  if (resource) {
    const {
      '@type': type,
    } = resource;
    const types: string[] = Array.isArray(type) ? type : [type || ''];

    return (
      <ResourcePreviewCard>
        {showFullCard ? (
          <ResourceCard resource={resource} onClickCollapse={() => setShowFullCard(false)} />
        ) : (
          <ResourceCardCollapsed resourceId={resourceId} onClickExpand={() => setShowFullCard(true)} busy={busy} types={types} />
        )}
      </ResourcePreviewCard>
    );
  }

  return null;
}

export default ResourcePreviewCardContainer;