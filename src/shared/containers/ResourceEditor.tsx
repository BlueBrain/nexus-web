import * as React from 'react';
import { ExpandedResource, ResourceSource, Resource } from '@bbp/nexus-sdk';
import { useNexusContext } from '@bbp/react-nexus';

import ResourceEditor from '../components/ResourceEditor';
import { displayError } from '../../subapps/projects/components/Notifications';

const ResourceEditorContainer: React.FunctionComponent<{
  resourceId: string;
  orgLabel: string;
  projectLabel: string;
  rev: number;
  defaultExpanded?: boolean;
  defaultEditable?: boolean;
  onSubmit: (value: object) => void;
  onExpanded?: (expanded: boolean) => void;
  tabChange?: boolean;
}> = ({
  resourceId,
  orgLabel,
  projectLabel,
  rev,
  defaultEditable = false,
  defaultExpanded = false,
  onSubmit,
  onExpanded,
  tabChange,
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

  React.useEffect(() => {
    setResource({
      resource,
      error: null,
      busy: true,
    });

    getNewResource()
      .then(response =>
        setResource({
          resource: response,
          error: null,
          busy: false,
        })
      )
      .catch(error => {
        displayError(error, 'Failed to load JSON payload');
        setResource({
          resource: null,
          error,
          busy: false,
        });
      });
  }, [
    resourceId,
    projectLabel,
    orgLabel,
    rev,
    expanded,
    showMetadata,
    tabChange,
  ]);

  const handleFormatChange = () => {
    onExpanded && onExpanded(!expanded);
    setExpanded(!expanded);
  };

  const handleMetaDataChange = () => {
    setShowMetadata(!showMetadata);
  };

  const getNewResource = async () => {
    if (expanded) {
      return await nexus.Resource.get(
        orgLabel,
        projectLabel,
        encodeURIComponent(resourceId),
        {
          rev,
          format: 'expanded',
        }
      );
    }
    if (showMetadata) {
      return await nexus.Resource.get(
        orgLabel,
        projectLabel,
        encodeURIComponent(resourceId),
        {
          rev,
        }
      );
    }
    return await nexus.Resource.getSource(
      orgLabel,
      projectLabel,
      encodeURIComponent(resourceId),
      undefined,
      { rev }
    );
  };

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
