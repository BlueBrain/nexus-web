import * as React from 'react';
import { Button } from 'antd';
import { useNexusContext } from '@bbp/react-nexus';
import ResourceFormModal from '../components/Resources/ResourceFormModal';
import { ResourcePayload } from '@bbp/nexus-sdk';

const ResourceFormContainer: React.FunctionComponent<{
  orgLabel: string;
  projectLabel: string;
}> = ({ orgLabel, projectLabel }) => {
  const nexus = useNexusContext();
  const createResource = (schemaId: string, payload: ResourcePayload) => {
    // CANNOT create resource with schemaID
    // TODO: update after fix
    // https://github.com/BlueBrain/nexus/issues/788
    return nexus.Resource.create(orgLabel, projectLabel, payload);
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
