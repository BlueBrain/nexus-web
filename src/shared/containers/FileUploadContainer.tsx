import * as React from 'react';
import { useHistory } from 'react-router-dom';
import { Storage, NexusFile } from '@bbp/nexus-sdk';
import { useNexusContext } from '@bbp/react-nexus';

import FileUploader from '../components/FileUpload';

const FileUploadContainer: React.FunctionComponent<{
  projectLabel: string;
  orgLabel: string;
  showStorageMenu?: boolean;
  onFileUploaded?: (file: NexusFile) => void;
}> = ({ orgLabel, projectLabel, onFileUploaded }) => {
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

  const onFileUpload = async (file: File, storageId?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    const uploadedFile = await nexus.File.create(orgLabel, projectLabel, {
      file: formData,
      storage: storageId,
    });
    onFileUploaded && onFileUploaded(uploadedFile);
    return uploadedFile;
  };

  React.useEffect(() => {
    nexus.Storage.list(orgLabel, projectLabel)
      .then(data => setStorages(data._results))
      .catch(e => setStorages([]));
  }, [orgLabel, projectLabel]);

  return (
    storages && (
      <FileUploader
        {...{
          onFileUpload,
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

export default FileUploadContainer;
