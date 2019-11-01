import * as React from 'react';
import { useHistory } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Storage, NexusFile } from '@bbp/nexus-sdk';
import { useNexusContext } from '@bbp/react-nexus';

import FileUploader from '../components/FileUpload';
import { RootState } from '../store/reducers';

const FileUploadContainer: React.FunctionComponent<{
  projectLabel: string;
  orgLabel: string;
}> = ({ orgLabel, projectLabel }) => {
  const nexus = useNexusContext();
  const history = useHistory();
  const basePath = useSelector((state: RootState) => state.config.basePath);
  const [storages, setStorages] = React.useState<Storage[]>([]);

  const makeResourceUri = (resourceId: string) => {
    return `${basePath}/${orgLabel}/${projectLabel}/resources/${encodeURIComponent(
      resourceId
    )}`;
  };

  const goToResource = (resourceId: string) => {
    history.push(makeResourceUri(resourceId));
  };

  const onFileUpload = async (file: File, storageId?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    return await nexus.File.create(orgLabel, projectLabel, {
      '@id': file.name,
      file: formData,
      storage: storageId,
    });
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
