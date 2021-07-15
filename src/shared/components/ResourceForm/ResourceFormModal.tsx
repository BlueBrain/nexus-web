import * as React from 'react';
import { Modal } from 'antd';
import { Resource, ResourcePayload } from '@bbp/nexus-sdk';

import ResourceForm from './ResourceForm';
import { camelCaseToTitleCase } from '../../utils';
import useNotification from '../../hooks/useNotification';

interface ResourceFormModalProps {
  createResource: (
    schemaId: string,
    payload: ResourcePayload
  ) => Promise<Resource>;
  render: (updateFormVisible: () => void) => React.ReactElement<any>;
  onSuccess?: () => void;
}

const ResourceFormModal: React.FunctionComponent<ResourceFormModalProps> = ({
  createResource,
  render,
  onSuccess = () => {},
}) => {
  const [modalVisible, setModalVisible] = React.useState(false);
  const [formBusy, setFormBusy] = React.useState(false);
  const notification = useNotification();
  const saveAndCreate = async (resourceToCreate: any) => {
    const { schemaId, payload } = resourceToCreate;
    setFormBusy(true);
    try {
      const resource = await createResource(
        encodeURIComponent(schemaId),
        payload
      );
      notification.success({
        message: 'Resource saved',
        description: resource.name,
      });
      onSuccess();
      setFormBusy(false);
      setModalVisible(false);
    } catch (error) {
      notification.error({
        message: !!error['@type']
          ? camelCaseToTitleCase(error['@type'])
          : 'Error creating resource',
        description: error.reason,
      });
      setFormBusy(false);
    }
  };
  const updateFormVisible = () => {
    setModalVisible(!modalVisible);
  };
  return (
    <>
      <Modal
        title="New Resource"
        visible={modalVisible}
        destroyOnClose={true}
        onCancel={() => setModalVisible(false)}
        confirmLoading={formBusy}
        footer={null}
        width={800}
      >
        <ResourceForm onSubmit={(r: any) => saveAndCreate(r)} busy={formBusy} />
      </Modal>
      {render(updateFormVisible)}
    </>
  );
};

export default ResourceFormModal;
