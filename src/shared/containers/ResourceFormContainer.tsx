import * as React from 'react';
import { Button } from 'antd';
import { useNexusContext } from '@bbp/react-nexus';
import { ResourcePayload } from '@bbp/nexus-sdk';

import ResourceFormModal from '../components/ResourceForm/ResourceFormModal';

const ResourceFormContainer: React.FunctionComponent<{
  orgLabel: string;
  projectLabel: string;
}> = ({ orgLabel, projectLabel }) => {
  const nexus = useNexusContext();
  const createResource = (schemaId: string, payload: ResourcePayload) => {
    // TODO: bump @bbp/nexus-sdk
    return nexus.Resource.create(orgLabel, projectLabel, payload, schemaId);
  };

  return (
    <ResourceFormModal
      createResource={createResource}
      render={(updateFormVisible: () => void) => {
        return (
          <Button
            style={{ margin: '0.5em 0' }}
            type="primary"
            onClick={updateFormVisible}
            icon="plus-square"
          >
            Create Resource
          </Button>
        );
      }}
    />
  );
};

export default ResourceFormContainer;
