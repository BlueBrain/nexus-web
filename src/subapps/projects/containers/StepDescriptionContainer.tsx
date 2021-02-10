import * as React from 'react';
import { Resource } from '@bbp/nexus-sdk';
import { useNexusContext } from '@bbp/react-nexus';
import { Button } from 'antd';

import { displayError, successNotification } from '../components/Notifications';
import MarkdownEditorComponent from '../../../shared/components/MarkdownEditor';
import MarkdownViewerContainer from '../../../shared/containers/MarkdownViewer';

const StepDescriptionContainer: React.FC<{
  step: Resource;
  orgLabel: string;
  projectLabel: string;
  onUpdate(): void;
}> = ({ step, orgLabel, projectLabel, onUpdate }) => {
  const nexus = useNexusContext();
  const [isEditing, setIsEditing] = React.useState(false);

  const saveDescription = (value: string) => {
    nexus.Resource.getSource(
      orgLabel,
      projectLabel,
      encodeURIComponent(step['@id'])
    )
      .then(response => updateDescription(value, response as Resource))
      .then(() => {
        successNotification('Description is updated successfully');
        onUpdate();
      })
      .catch(error => displayError(error, 'Description update failed'));
  };

  const updateDescription = (
    description: string,
    originalPayload: Resource
  ) => {
    return nexus.Resource.update(
      orgLabel,
      projectLabel,
      encodeURIComponent(step['@id']),
      step._rev,
      {
        ...originalPayload,
        description,
      }
    );
  };

  const handleEditingClicked = () => {
    setIsEditing(!isEditing);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  console.log('description', step.description);

  return (
    <div>
      {isEditing ? (
        <MarkdownEditorComponent
          resource={step as Resource}
          readOnly={false}
          loading={false}
          onSave={saveDescription}
          onCancel={handleCancel}
          markdownViewer={MarkdownViewerContainer}
        />
      ) : (
        <MarkdownViewerContainer
          template={step.description || ''}
          data={step as Resource}
        />
      )}
      {!isEditing && (
        <Button onClick={handleEditingClicked}>Edit Description</Button>
      )}
    </div>
  );
};

export default StepDescriptionContainer;
