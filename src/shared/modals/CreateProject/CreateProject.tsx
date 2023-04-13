import * as React from 'react'
import { Modal } from 'antd';
import { TCreationUnitModal } from '../CreateOrganization/CreateOrganization';

type Props = TCreationUnitModal & {}


const CreateProject = ({ visible, updateVisibility }: Props) => {
  return (
    <Modal
        centered
        closable
        visible={visible}
        onCancel={() => updateVisibility(false)}
        footer={null}
    >
        
    </Modal>
  )
}

export default CreateProject;