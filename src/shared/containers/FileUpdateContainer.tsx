import * as React from 'react';
import { useHistory } from 'react-router-dom';
import { Storage, NexusFile } from '@bbp/nexus-sdk';
import { useNexusContext } from '@bbp/react-nexus';

import FileUpdate from '../components/FileUpdate';

const FileUpdateContainer: React.FunctionComponent<{
  projectLabel: string;
  orgLabel: string;
  assetId: string;
  showStorageMenu?: boolean;
  onFileUpdated?: (assetId: string, file: NexusFile) => void;
}> = ({ orgLabel, projectLabel, assetId, onFileUpdated }) => {
  const nexus = useNexusContext();
  const history = useHistory();
  const [storages, setStorages] = React.useState<Storage[]>([]);

  const makeResourceUri = (resourceId: string) => {
    return `/${orgLabel}/${projectLabel}/resources/${encodeURIComponent(
      resourceId
    )}`;
  };

  const goToResource = (resourceId: string) => {
    history.push(makeResourceUri(resourceId));
  };

  const onFileUpdate = async (file: File, storageId?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    const n = assetId.lastIndexOf('/');
    const result = assetId.substring(n + 1);

    console.log(
      '🚀 ~ file: FileUpdateContainer.tsx ~ line 35 ~ formData',
      formData,
      result
    );
    console.log(
      '🚀 ~ file: FileUpdateContainer.tsx ~ line 35 ~ Asset Id encoded and not',
      assetId,
      encodeURIComponent(assetId)
    );

    const asset = (await nexus.File.get(
      orgLabel,
      projectLabel,
      encodeURIComponent(assetId)
    )) as NexusFile;

    const updatedFile = await nexus.File.update(orgLabel, projectLabel, {
      '@id': encodeURIComponent(assetId),
      file: formData,
      storage: storageId,
      rev: asset._rev,
    });
    onFileUpdated && onFileUpdated(assetId, updatedFile);
    console.log(
      '🚀 ~ UPDATE file: FileUpdateContainer.tsx ~ line 35 ~ onFileUpdate ~ upDatedFile',
      updatedFile
    );
    return updatedFile;
  };

  React.useEffect(() => {
    nexus.Storage.list(orgLabel, projectLabel)
      .then(data => setStorages(data._results))
      .catch(e => setStorages([]));
  }, [orgLabel, projectLabel]);

  return (
    storages && (
      <FileUpdate
        {...{
          onFileUpdate,
          assetId,
          projectLabel,
          storages,
          orgLabel,
          makeFileLink: (nexusFile: NexusFile) =>
            makeResourceUri(nexusFile['@id']),
          goToFile: (nexusFile: NexusFile) => goToResource(nexusFile['@id']),
        }}
      />
    )
  );
};

export default FileUpdateContainer;
