import * as React from 'react';
import { Button } from 'antd';
import { useNexusContext } from '@bbp/react-nexus';
import { ResourcePayload } from '@bbp/nexus-sdk';

import ResourceFormModal from '../components/ResourceForm/ResourceFormModal';
import Icon from '@ant-design/icons/lib/components/Icon';

const ResourceFormContainer: React.FunctionComponent<{
  orgLabel: string;
  projectLabel: string;
  onResourceCreated?(): void;
}> = ({ orgLabel, projectLabel, onResourceCreated }) => {
  const nexus = useNexusContext();
  const createResource = (schemaId: string, payload: ResourcePayload) => {
    return nexus.Resource.create(orgLabel, projectLabel, payload, schemaId);
  };

  return (
    <ResourceFormModal
      onSuccess={onResourceCreated}
      createResource={createResource}
      render={(updateFormVisible: () => void) => {
        return (
          <Button
            style={{ margin: '0.5em 0' }}
            type="primary"
            onClick={updateFormVisible}
          >
            <Icon
              type="plus-square"
              style={{ fontSize: '16px', color: 'white' }}
            />
            Create Resource
          </Button>
        );
      }}
    />
  );
};

export default ResourceFormContainer;
