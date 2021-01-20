import * as React from 'react';
import { Button, notification } from 'antd';
import { useNexusContext } from '@bbp/react-nexus';

import { useInputs } from '../hooks/useInputs';
import InputsTable from '../components/InputsTable';
import useLocalStorage from '../../../shared/hooks/useLocalStorage';
import { DATASET_KEY } from '../../search/components/ResultGridActions';
import { forceAsArray } from '../../../shared/utils';

const InputsContainer: React.FC<{
  orgLabel: string;
  projectLabel: string;
  stepId: string;
}> = ({ orgLabel, projectLabel, stepId }) => {
  const { inputs } = useInputs(orgLabel, projectLabel, stepId);
  const [collection, setCollection] = useLocalStorage(DATASET_KEY);
  const nexus = useNexusContext();

  React.useEffect(() => {
    if (!collection || !collection?.ids.length) {
      return;
    }

    const key = `${orgLabel}-${projectLabel}-${stepId}`;

    const createInputInWorkflowStep = async () => {
      const workflowStep = await nexus.Resource.get<{
        'nxv:inputs': [];
        _rev: number;
      }>(orgLabel, projectLabel, encodeURIComponent(stepId));
      const datasetResource = await nexus.Resource.create(
        orgLabel,
        projectLabel,
        {
          '@type': ['nxv:Dataset', 'nxv:Collection'],
          collection: collection.ids.map((id: string) => ({ '@id': id })),
          'http://schema.org/name': 'Imported Collection',
          'nxv:description': 'Imported collection from Search',
        }
      );

      const updatedInputs = [
        ...forceAsArray(workflowStep['nxv:inputs']),
        { '@id': datasetResource['@id'] },
      ];

      await nexus.Resource.update(
        orgLabel,
        projectLabel,
        encodeURIComponent(stepId),
        workflowStep._rev,
        {
          ...workflowStep,
          'nxv:inputs': updatedInputs,
        }
      );
      notification.close(key);
      setCollection(null);
      // TODO
      // The user won't see the list updated unless they refresh, because it takes time to propogate.
      // How to improve that experience?
    };

    const btn = (
      <div>
        <Button
          type="primary"
          size="small"
          onClick={createInputInWorkflowStep}
          style={{ marginRight: '4px' }}
        >
          Create Input
        </Button>
        <Button size="small" onClick={() => notification.close(key)}>
          Dismiss
        </Button>
      </div>
    );

    notification.info({
      key,
      btn,
      duration: null,
      message: 'Import Dataset?',
      description:
        'You have saved a dataset from search. Would you like to add it to this workflow step as an input?',
    });
    return () => {
      notification.close(key);
    };
  }, [collection, orgLabel, projectLabel, stepId]);

  return <InputsTable inputs={inputs} />;
};

export default InputsContainer;
