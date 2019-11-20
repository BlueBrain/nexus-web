import * as React from 'react';
import { useAsyncEffect } from 'use-async-effect';
import { useNexusContext } from '@bbp/react-nexus';
import { Resource } from '@bbp/nexus-sdk';

import ResourceCard from '../components/ResourceCard';
import ResourceCardCollapsed from '../components/ResourceCard/ResourceCardCollapsed';
import ResourcePreviewCard from '../components/ResourceCard/ResourcePreviewCard';
import {
  getResourceLabelsAndIdsFromSelf,
  labelOf,
  getResourceLabel,
} from '../utils';

const ResourcePreviewCardContainer: React.FunctionComponent<{
  resourceSelf: string;
  isExternal: boolean | null;
}> = ({ resourceSelf, isExternal }) => {
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

  const { resourceId } = getResourceLabelsAndIdsFromSelf(resourceSelf);

  useAsyncEffect(
    async isMounted => {
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
        const nextResource = (await nexus.httpGet({
          path: resourceSelf,
          headers: {
            Accept: 'application/json',
          },
        })) as Resource;
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
    },
    [resourceSelf]
  );

  if (isExternal) {
    const label = labelOf(resourceId);
    return (
      <ResourcePreviewCard>
        <ResourceCardCollapsed label={label} busy={busy} isExternal />
      </ResourcePreviewCard>
    );
  }

  if (resource) {
    const label = getResourceLabel(resource);
    const { '@type': type } = resource;
    const types: string[] = Array.isArray(type) ? type : [type || ''];

    return (
      <ResourcePreviewCard>
        {showFullCard ? (
          <ResourceCard
            resource={resource}
            onClickCollapse={() => setShowFullCard(false)}
          />
        ) : (
          <ResourceCardCollapsed
            label={label}
            onClickExpand={() => setShowFullCard(true)}
            busy={busy}
            types={types}
          />
        )}
      </ResourcePreviewCard>
    );
  }

  return null;
};

export default ResourcePreviewCardContainer;
