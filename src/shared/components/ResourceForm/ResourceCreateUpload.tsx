import './ResourceCreateUpload.scss';

import { Resource, ResourcePayload } from '@bbp/nexus-sdk/es';
import { notification } from 'antd';
import * as React from 'react';

import { TErrorWithType } from '../../../utils/types';
import FileUploadContainer from '../../containers/FileUploadContainer';
import { camelCaseToTitleCase } from '../../utils';
import ResourceForm from './ResourceForm';

const ResourceCreateUpload: React.FunctionComponent<{
  orgLabel: string;
  projectLabel: string;
  createResource: (
    schemaId: string,
    payload: ResourcePayload
  ) => Promise<Resource>;
}> = ({ orgLabel, projectLabel, createResource }) => {
  const [formBusy, setFormBusy] = React.useState(false);

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
      //   onSuccess();
      setFormBusy(false);
      //   setModalVisible(false);
      return true;
    } catch (error) {
      notification.error({
        message: (error as TErrorWithType)['@type']
          ? camelCaseToTitleCase((error as TErrorWithType)['@type'])
          : 'Error creating resource',
        description: (error as TErrorWithType).reason,
      });
      setFormBusy(false);
      return false;
    }
  };
  return (
    <div className="add-resource">
      <div className="add-resource__editor">
        <ResourceForm onSubmit={(r: any) => saveAndCreate(r)} busy={formBusy} />
      </div>
      <div className="add-resource__upload">
        <FileUploadContainer orgLabel={orgLabel} projectLabel={projectLabel} />
      </div>
    </div>
  );
};

export default ResourceCreateUpload;
