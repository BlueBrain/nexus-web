import * as React from 'react';
import { Modal } from 'antd';

import ActioButton from '../components/ActionButton';
import TemplatesList from '../components/Templates/TemplatesList';

const templates = [
  {
    name: 'Single Cell Model',
    description: 'This is an example description',
    version: 1.0,
    updatedOn: '2020-09-10T09:40:58Z',
    totalContributors: 2,
    author: 'Author',
  },
  {
    name: 'Morphology Visualisation',
    description: 'This is an example description',
    version: 1.2,
    updatedOn: '2020-09-15T09:40:58Z',
    totalContributors: 1,
    author: 'Author',
  },
];

const TemplatesContainer: React.FC<{}> = () => {
  const [showTemplates, setShowTemplates] = React.useState<boolean>(false);

  return (
    <>
      <ActioButton
        icon="Add"
        onClick={() => setShowTemplates(true)}
        title="Add activities from template"
      />
      <Modal
        maskClosable
        visible={showTemplates}
        footer={null}
        onCancel={() => setShowTemplates(false)}
        width={680}
        destroyOnClose={true}
      >
        <TemplatesList templates={templates} />
      </Modal>
    </>
  );
};

export default TemplatesContainer;
