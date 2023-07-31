import * as React from 'react';
import { Button, notification, Input } from 'antd';
import { useNexusContext } from '@bbp/react-nexus';
import { Storage, NexusFile, Resource } from '@bbp/nexus-sdk/es';
import { useInputs } from '../hooks/useInputs';
import useLocalStorage from '../../../shared/hooks/useLocalStorage';
import { forceAsArray } from '../../../shared/utils';
import FileUploader from '../../../shared/components/FileUpload';
import { TError } from '../../../utils/types';
import './InputsContainer.scss';

export const DATASET_KEY = 'nexus-dataset';
const InputsContainer: React.FC<{
  orgLabel: string;
  projectLabel: string;
  stepId: string;
  onSuccess: () => void;
  onCancel: () => void;
}> = ({ orgLabel, projectLabel, stepId, onSuccess, onCancel }) => {
  const { inputs, fetchInputs } = useInputs(orgLabel, projectLabel, stepId);
  const [collection, setCollection] = useLocalStorage(DATASET_KEY);
  const nexus = useNexusContext();
  const [storages, setStorages] = React.useState<Storage[]>([]);
  const [dataSetName, setDataSetName] = React.useState<string>('');
  const [dataSetDescription, setDataSetDescription] = React.useState<string>(
    ''
  );
  const [nexusFiles, setNexusFiles] = React.useState<NexusFile[]>([]);

  const makeResourceUri = (resourceId: string) => {
    return `/${orgLabel}/${projectLabel}/resources/${encodeURIComponent(
      resourceId
    )}`;
  };
  const createDataSetResource = async (
    description: string,
    datasetName: string,
    distribution: any[]
  ) => {
    const datasetResource = await nexus.Resource.create(
      orgLabel,
      projectLabel,
      {
        '@type': [
          'http://schema.org/Dataset',
          'http://www.w3.org/ns/prov#Entity',
        ],
        'http://schema.org/description': `${description}`,
        'http://schema.org/distribution': distribution,
        'http://schema.org/name': `${datasetName}`,
      }
    );
    return datasetResource;
  };

  const saveDataSet = async () => {
    if (nexusFiles) {
      const distribution = nexusFiles.map(file => {
        return {
          '@type': 'http://schema.org/DataDownload',
          'http://schema.org/contentUrl': {
            '@id': `${file['@id']}`,
          },
          'http://schema.org/name': `${file._filename}`,
        };
      });
      const dataSetResource = await createDataSetResource(
        dataSetDescription,
        dataSetName,
        distribution
      );
      const resourceUpdated = await updateStepResource(dataSetResource);
      if (resourceUpdated) {
        notification.success({
          message: 'Dataset created',
        });
        onSuccess();
      }
    } else {
      notification.info({ message: 'Please upload a file' });
    }
  };

  const updateStepResource = async (datasetResource: Resource) => {
    const workflowStep = (await nexus.Resource.get<{
      'nxv:input': [];
      _rev: number;
    }>(orgLabel, projectLabel, encodeURIComponent(stepId))) as Resource;
    const updatedInputs = [
      ...forceAsArray(workflowStep['nxv:input']),
      {
        '@id': datasetResource['@id'],
      },
    ];
    const resourceUpdated = await nexus.Resource.update(
      orgLabel,
      projectLabel,
      encodeURIComponent(stepId),
      workflowStep._rev,
      {
        ...workflowStep,
        'nxv:input': updatedInputs,
      }
    );
    // TODO: Improve this by using some sort of feed back from backend on indexing.
    setTimeout(fetchInputs, 3 * 1000);

    return resourceUpdated;
  };

  const onFileUpload = async (file: File, storageId?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    const nexusFile = await nexus.File.create(orgLabel, projectLabel, {
      file: formData,
      storage: storageId,
    });
    setNexusFiles([...nexusFiles, nexusFile]);
    return nexusFile;
  };

  React.useEffect(() => {
    if (!collection || !collection?.ids.length) {
      return;
    }

    const key = `${orgLabel}-${projectLabel}-${stepId}`;

    const createInputInWorkflowStep = async () => {
      try {
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

        updateStepResource(datasetResource);

        notification.close(key);
        setCollection(null);
        notification.open({
          message: 'Inputs successfully updated',
          description: 'You may have to refresh the page to see changes.',
        });
      } catch (error) {
        notification.error({
          message: 'Could not import saved collection',
          description: (error as TError).message,
          duration: null,
        });
      }
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

  React.useEffect(() => {
    nexus.Storage.list(orgLabel, projectLabel)
      .then(data => setStorages(data._results))
      .catch(e => setStorages([]));
  }, [orgLabel, projectLabel]);

  return (
    <div className="inputs-container">
      <div className="dataset-container">
        <div className="dataset-inputs">
          <label>Name</label>
          <Input
            placeholder="<dataset_name>"
            onChange={e => {
              setDataSetName(e.target.value);
            }}
          ></Input>
        </div>
        <div className="dataset-inputs">
          <label>Description</label>
          <Input
            style={{ margin: '0px 10px 0xp 10px' }}
            placeholder="<dataset_description>"
            onChange={e => {
              setDataSetDescription(e.target.value);
            }}
          />
        </div>
        <FileUploader
          {...{
            onFileUpload,
            projectLabel,
            storages,
            orgLabel,
            makeFileLink: (nexusFile: NexusFile) =>
              makeResourceUri(nexusFile['@id']),
            goToFile: (nexusFile: NexusFile) => {},
          }}
        />
        <div className="save-dataset">
          <Button onClick={onCancel}>Cancel</Button>
          <Button
            type="primary"
            onClick={() => {
              saveDataSet();
            }}
          >
            Save
          </Button>
        </div>
      </div>
      {/* TODO: display in WF Step View when updated
      <InputsTable inputs={inputs} /> */}
    </div>
  );
};

export default InputsContainer;
