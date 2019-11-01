import * as React from 'react';
import { useAsyncEffect } from 'use-async-effect';
import { ExpandedResource, ResourceSource, Resource, NexusClient } from '@bbp/nexus-sdk';
import { useNexusContext } from '@bbp/react-nexus';

import { getResourceLabelsAndIdsFromSelf } from '../utils';
import ResourceEditor from '../components/ResourceEditor';


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
  const [showMetaData, setShowMetaData] = React.useState<boolean>(false);
  
  const {
    orgLabel,
    projectLabel,
    resourceId,
  } = getResourceLabelsAndIdsFromSelf(self);
  const [{ busy, resource, error }, setResource] = React.useState<{
    busy: boolean;
    resource: ResourceSource | ExpandedResource | Resource |null;
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
    setShowMetaData(!showMetaData);
  };

  const getNewResource = async () => {
    if(expanded) {
      return  await nexus.Resource.get(orgLabel, projectLabel, resourceId, {
        rev,
        format: 'expanded',
      })
    } 
    if(showMetaData) {
      return await nexus.Resource.get(orgLabel, projectLabel, resourceId);
    } 
    return await nexus.Resource.getSource(orgLabel, projectLabel, resourceId);
  }

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

        const  newResource =  await getNewResource();

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
    [self, rev, expanded, showMetaData]
  );

  return (
    resource && (
      <ResourceEditor
        busy={busy}
        rawData={resource}
        onSubmit={onSubmit}
        onFormatChange={handleFormatChange}
        onMetaDataChange={handleMetaDataChange}
        editable={defaultEditable && !expanded && !showMetaData}
        expanded={expanded}
        metaData={showMetaData}
      />
    )
  );
};

export default ResourceEditorContainer;
