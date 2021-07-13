import * as React from 'react';
import { Modal } from 'antd';
import { useNexusContext } from '@bbp/react-nexus';

import ActioButton from '../components/ActionButton';
import TemplatesList from '../components/Templates/TemplatesList';
import { Template } from '../components/Templates/TemplateCard';
import fusionConfig from '../config';
import useNotification, {
  parseNexusError,
} from '../../../shared/hooks/useNotification';

const TemplatesContainer: React.FC<{}> = () => {
  const nexus = useNexusContext();
  const notification = useNotification();

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
        .catch(error =>
          notification.error({
            message: 'An error occurred',
            description: parseNexusError(error),
          })
        );
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
      .catch(error =>
        notification.error({
          message: 'An error occurred',
          description: parseNexusError(error),
        })
      );
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
