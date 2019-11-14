import * as React from 'react';
import { useAsyncEffect } from 'use-async-effect';
import { useNexusContext } from '@bbp/react-nexus';
import { Resource } from '@bbp/nexus-sdk';
import { Card } from 'antd';

import ResourceCard from '../components/ResourceCard';
import ResourceCardCollapsed from '../components/ResourceCard/ResourceCardCollapsed';

const ResourcePreviewCardContainer: React.FunctionComponent<{
    orgLabel: string,
    projectLabel: string,
    resourceId: string,
}> = ({ orgLabel, projectLabel, resourceId }) => {
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
  
  if (resource) {		
    return (
      <div style={{
        margin: '20px',
        position: 'absolute',
        bottom: 0,
        right: 0,
        maxWidth: '600px',
      }}>
        {showFullCard ? (
          <ResourceCard resource={resource} onClickCollapse={() => setShowFullCard(false)} />
        ) : (
          <ResourceCardCollapsed resource={resource} onClickExpand={() => setShowFullCard(true)} busy={busy} />
        )}
      </div>
    );
  }

  return null;
}

export default ResourcePreviewCardContainer;