import { PlusSquareOutlined } from '@ant-design/icons';
import { useNexusContext } from '@bbp/react-nexus';
import { Button, message, Modal } from 'antd';
import * as React from 'react';

import { saveImage } from '../../../shared/containers/MarkdownEditorContainer';
import MarkdownViewerContainer from '../../../shared/containers/MarkdownViewer';
import useNotification, { parseNexusError } from '../../../shared/hooks/useNotification';
import { TErrorWithType } from '../../../utils/types';
import STUDIO_CONTEXT from '../components/StudioContext';
import StudioEditorForm from '../components/StudioEditorForm';

export const DEFAULT_STUDIO_TYPE = 'https://bluebrainnexus.io/studio/vocabulary/Studio';

const CreateStudioContainer: React.FC<{
  orgLabel: string;
  projectLabel: string;
  goToStudio?(studioId: string): void;
}> = ({ orgLabel, projectLabel, goToStudio }) => {
  const nexus = useNexusContext();
  const [showModal, setShowModal] = React.useState(false);
  const notification = useNotification();

  const generateStudioResource = (
    label: string,
    description?: string,
    plugins?: {
      customise: boolean;
      plugins: { key: string; expanded: boolean }[];
    }
  ) => ({
    label,
    description,
    plugins,
    '@context': STUDIO_CONTEXT['@id'],
    '@type': DEFAULT_STUDIO_TYPE,
  });

  const makeStudioContext = async () => {
    try {
      await nexus.Resource.get(orgLabel, projectLabel, encodeURIComponent(STUDIO_CONTEXT['@id']));
    } catch (error) {
      if ((error as TErrorWithType['@type']) === 'ResourceNotFound') {
        // @ts-ignore TODO: update resource type in SDK to allow nested objects
        // https://github.com/BlueBrain/nexus/issues/937
        await nexus.Resource.create(orgLabel, projectLabel, {
          ...STUDIO_CONTEXT,
        });
        return;
      }
      throw error;
    }
  };

  const createStudioResource = async (
    label: string,
    description?: string,
    plugins?: {
      customise: boolean;
      plugins: { key: string; expanded: boolean }[];
    }
  ) => {
    await makeStudioContext();
    return await nexus.Resource.create(
      orgLabel,
      projectLabel,
      generateStudioResource(label, description, plugins)
    );
  };

  const saveStudio = (
    label: string,
    description?: string,
    plugins?: {
      customise: boolean;
      plugins: { key: string; expanded: boolean }[];
    }
  ) => {
    setShowModal(false);

    createStudioResource(label, description, plugins)
      .then((response) => {
        goToStudio && goToStudio(response['@id']);

        message.success(
          <span>
            Studio <em>{label}</em> created
          </span>
        );
      })
      .catch((error) => {
        notification.error({
          message: 'An error occurred',
          description: parseNexusError(error),
        });
      });
  };

  return (
    <div className="studio-modal">
      <Button type="primary" block onClick={() => setShowModal(true)}>
        <PlusSquareOutlined style={{ fontSize: '16px', color: 'white' }} />
        Create Studio
      </Button>
      <Modal
        title="Create Studio"
        open={showModal}
        footer={null}
        onCancel={() => setShowModal(false)}
        destroyOnClose={true}
      >
        <StudioEditorForm
          saveStudio={saveStudio}
          onSaveImage={saveImage(nexus, orgLabel, projectLabel)}
          markdownViewer={MarkdownViewerContainer}
        />
      </Modal>
    </div>
  );
};

export default CreateStudioContainer;
