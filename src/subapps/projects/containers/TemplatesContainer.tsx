import * as React from 'react';
import { Modal, notification } from 'antd';
import { useNexusContext } from '@bbp/react-nexus';

import ActioButton from '../components/ActionButton';
import TemplatesList from '../components/Templates/TemplatesList';
import { Template } from '../components/Templates/TemplateCard';
import fusionConfig from '../config';

type NexusError = {
  reason?: string;
  message?: string;
  [key: string]: any;
};

const TemplatesContainer: React.FC<{}> = () => {
  const nexus = useNexusContext();

  const [showTemplates, setShowTemplates] = React.useState<boolean>(false);
  const [templates, setTemplates] = React.useState<Template[]>([]);

  const { configOrg, configProject, templateType } = fusionConfig;

  React.useEffect(() => {
    if (showTemplates) {
      nexus.Resource.list(configOrg, configProject, {
        type: templateType,
        deprecated: false,
      })
        .then(response => {
          fetchTemplates(response._results);
        })
        .catch(error => displayError(error));
    }
  }, [showTemplates]);

  const displayError = (error: NexusError) => {
    notification.error({
      message: 'An error occurred',
      description: error.message || error.reason || 'An unknown error occurred',
      duration: 3,
    });
  };

  const fetchTemplates = (templates: any) => {
    Promise.all(
      templates.map((template: any) => {
        return nexus.Resource.get(
          configOrg,
          configProject,
          encodeURIComponent(template['@id'])
        );
      })
    )
      .then(response => setTemplates(response as Template[]))
      .catch(error => displayError(error));
  };

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
