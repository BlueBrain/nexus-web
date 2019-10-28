import * as React from 'react';
import { useAsyncEffect } from 'use-async-effect';
import { ExpandedResource, ResourceSource } from '@bbp/nexus-sdk';
import { useNexusContext } from '@bbp/react-nexus';

import ResourceEditor from '../components/Resources/ResourceEditor';
import { getResourceLabelsAndIdsFromSelf } from '../utils';

const ResourceEditorContainer: React.FunctionComponent<{
  self: string;
  rev: number;
  defaultExpanded?: boolean;
  defaultEditable?: boolean;
  onSubmit: (value: object) => void;
  onExpanded?: (expanded: boolean) => void;
}> = ({
  self,
  rev,
  defaultEditable = false,
  defaultExpanded = false,
  onSubmit,
  onExpanded,
}) => {
  const nexus = useNexusContext();
  const [expanded, setExpanded] = React.useState(defaultExpanded);
  const {
    orgLabel,
    projectLabel,
    resourceId,
  } = getResourceLabelsAndIdsFromSelf(self);
  const [{ busy, resource, error }, setResource] = React.useState<{
    busy: boolean;
    resource: ResourceSource | ExpandedResource | null;
    error: Error | null;
  }>({
    busy: false,
    resource: null,
    error: null,
  });

  const handleFormatChange = () => {
    onExpanded && onExpanded(!expanded);
    setExpanded(!expanded);
  };

  useAsyncEffect(
    async isMounted => {
      if (!isMounted()) {
        return;
      }
      try {
        setResource({
          resource,
          error: null,
          busy: true,
        });
        const newResource = expanded
          ? await nexus.Resource.get(orgLabel, projectLabel, resourceId, {
              rev,
              format: 'expanded',
            })
          : await nexus.Resource.getSource(orgLabel, projectLabel, resourceId);

        setResource({
          resource: newResource,
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
    [self, rev, expanded]
  );

  return (
    resource && (
      <ResourceEditor
        busy={busy}
        rawData={resource}
        onSubmit={onSubmit}
        onFormatChange={handleFormatChange}
        editable={defaultEditable && !expanded}
        expanded={expanded}
      />
    )
  );
};

export default ResourceEditorContainer;
