import * as React from 'react';
import { Modal, notification, Button } from 'antd';
import { useNexusContext } from '@bbp/react-nexus';
import { displayError } from '../components/Notifications';

import ActioButton from '../components/ActionButton';
import TemplatesList from '../components/Templates/TemplatesList';
import { Template } from '../components/Templates/TemplateCard';
import fusionConfig from '../config';

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
        .catch(error => displayError(error, 'An error occurred'));
    }
  }, [showTemplates]);

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
      .catch(error => displayError(error, 'An error occurred'));
  };

  const addActivitiesFromTemplate = (id: string) => {
    // TODO: add activities from template to the project
  };

  return (
    <>
      <ActioButton
        icon="Add"
        onClick={() => setShowTemplates(true)}
        title="Add steps from template"
      />
      <Modal
        maskClosable
        visible={showTemplates}
        footer={null}
        onCancel={() => setShowTemplates(false)}
        width={680}
        destroyOnClose={true}
      >
        <>
          <TemplatesList
            templates={templates}
            onClickAdd={addActivitiesFromTemplate}
          />
        </>
      </Modal>
    </>
  );
};

export default TemplatesContainer;
