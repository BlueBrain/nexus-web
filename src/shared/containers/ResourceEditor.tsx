import * as React from 'react';
import { useAsyncEffect } from 'use-async-effect';
import {
  ExpandedResource,
  ResourceSource,
  Resource,
  NexusClient,
} from '@bbp/nexus-sdk';
import { useNexusContext } from '@bbp/react-nexus';

import ResourceEditor from '../components/ResourceEditor';

const ResourceEditorContainer: React.FunctionComponent<{
  resourceId: string;
  orgLabel: string;
  projectLabel: string;
  rev: number;
  defaultExpanded?: boolean;
  defaultEditable?: boolean;
  onSubmit: (value: object) => void;
  onExpanded?: (expanded: boolean) => void;
}> = ({
  resourceId,
  orgLabel,
  projectLabel,
  rev,
  defaultEditable = false,
  defaultExpanded = false,
  onSubmit,
  onExpanded,
}) => {
  const nexus = useNexusContext();
  const [expanded, setExpanded] = React.useState(defaultExpanded);
  const [showMetadata, setShowMetadata] = React.useState<boolean>(false);
  const [{ busy, resource, error }, setResource] = React.useState<{
    busy: boolean;
    resource: ResourceSource | ExpandedResource | Resource | null;
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

  const handleMetaDataChange = () => {
    setShowMetadata(!showMetadata);
  };

  const getNewResource = async () => {
    if (expanded) {
      return await nexus.Resource.get(orgLabel, projectLabel, resourceId, {
        rev,
        format: 'expanded',
      });
    }
    if (showMetadata) {
      return await nexus.Resource.get(orgLabel, projectLabel, resourceId, {
        rev,
      });
    }
    return await nexus.Resource.getSource(
      orgLabel,
      projectLabel,
      encodeURIComponent(resourceId),
      undefined,
      { rev }
    );
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

        const newResource = await getNewResource();

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
    [resourceId, projectLabel, orgLabel, rev, expanded, showMetadata]
  );

  return (
    resource && (
      <ResourceEditor
        busy={busy}
        rawData={resource}
        onSubmit={onSubmit}
        onFormatChange={handleFormatChange}
        onMetadataChange={handleMetaDataChange}
        editable={defaultEditable && !expanded && !showMetadata}
        expanded={expanded}
        showMetadata={showMetadata}
      />
    )
  );
};

export default ResourceEditorContainer;
