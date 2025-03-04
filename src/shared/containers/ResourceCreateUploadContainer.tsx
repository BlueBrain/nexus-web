import * as React from 'react';
import { ResourcePayload } from '@bbp/nexus-sdk/es';
import { useNexusContext } from '@bbp/react-nexus';
import ResourceCreateUpload from '../components/ResourceForm/ResourceCreateUpload';

const ResourceCreateUploadContainer: React.FunctionComponent<{
  orgLabel: string;
  projectLabel: string;
}> = ({ orgLabel, projectLabel }) => {
  const nexus = useNexusContext();
  const createResource = (schemaId: string, payload: ResourcePayload) => {
    return nexus.Resource.create(orgLabel, projectLabel, payload, schemaId);
  };

  return (
    <ResourceCreateUpload
      orgLabel={orgLabel}
      projectLabel={projectLabel}
      createResource={createResource}
    />
  );
};

export default ResourceCreateUploadContainer;
