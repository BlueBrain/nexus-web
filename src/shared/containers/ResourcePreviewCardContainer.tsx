import { Resource } from '@bbp/nexus-sdk/es';
import { useNexusContext } from '@bbp/react-nexus';
import * as React from 'react';

import { ElementNodeData } from '../components/Graph';
import ResourceCard from '../components/ResourceCard';
import ResourceCardCollapsed from '../components/ResourceCard/ResourceCardCollapsed';
import ResourcePreviewCard from '../components/ResourceCard/ResourcePreviewCard';
import useNotification from '../hooks/useNotification';
import { getResourceLabel,labelOf } from '../utils';

const ResourcePreviewCardContainer: React.FunctionComponent<{
  resourceData?: ElementNodeData['resourceData'];
  absoluteAddress: string;
}> = ({ resourceData, absoluteAddress }) => {
  const isExternal = !resourceData;
  const nexus = useNexusContext();
  const [showFullCard, setShowFullCard] = React.useState(false);
  const [{ busy, resource, error }, setResource] = React.useState<{
    busy: boolean;
    resource: Resource<any> | null;
    error: Error | null;
  }>({
    busy: false,
    resource: null,
    error: null,
  });
  const notification = useNotification();

  React.useEffect(() => {
    if (isExternal) {
      setResource({
        resource: null,
        error: null,
        busy: false,
      });
      return;
    }

    setResource({
      resource,
      error: null,
      busy: true,
    });

    if (resourceData) {
      const { orgLabel, projectLabel, resourceId } = resourceData;
      nexus.Resource.get(orgLabel, projectLabel, encodeURIComponent(resourceId))
        .then(resource => {
          setResource({
            resource,
            error: null,
            busy: false,
          });
        })
        .catch(error => {
          notification.error({
            message: "Couldn't load a resource info",
            description: error.message,
          });

          setResource({
            error,
            resource,
            busy: false,
          });
        });
    }
  }, [resourceData && resourceData.resourceId]);

  if (error) return null;

  if (isExternal) {
    const label = labelOf(absoluteAddress);
    return (
      <ResourcePreviewCard>
        <ResourceCardCollapsed
          label={label}
          resourceUrl={absoluteAddress}
          busy={busy}
          isExternal
        />
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
            resourceUrl={absoluteAddress}
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
