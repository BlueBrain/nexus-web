import * as React from 'react';
import { Resource } from '@bbp/nexus-sdk';
import { useNexusContext } from '@bbp/react-nexus';

import MarkdownEditor from '../../../shared/components/MarkdownEditor';
import { displayError, successNotification } from '../components/Notifications';

const StepDescriptionContainer: React.FC<{
  step: Resource;
  orgLabel: string;
  projectLabel: string;
  onUpdate(): void;
}> = ({ step, orgLabel, projectLabel, onUpdate }) => {
  const nexus = useNexusContext();

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

  return null;
  // TODO: update MarkdownEditor
  // <MarkdownEditor
  //   resource={step as Resource}
  //   readOnly={false}
  //   loading={false}
  //   onSave={saveDescription}
  // />
};

export default StepDescriptionContainer;
