import * as React from 'react';
import { connect } from 'react-redux';
import { push } from 'connected-react-router';
import { Storage, NexusFile } from '@bbp/nexus-sdk';
import { useNexusContext } from '@bbp/react-nexus';

import FileUploader from '../components/FileUpload';
import { RootState } from '../store/reducers';

const FileUploadContainer: React.FunctionComponent<{
  projectLabel: string;
  orgLabel: string;
  makeFileLink: (
    orgLabel: string,
    projectLabel: string,
    nexusFile: NexusFile
  ) => string;
  goToFile: (
    orgLabel: string,
    projectLabel: string,
    nexusFile: NexusFile
  ) => void;
}> = ({ orgLabel, projectLabel, makeFileLink, goToFile }) => {
  const nexus = useNexusContext();
  const [storages, setStorages] = React.useState<Storage[]>([]);

  const onFileUpload = async (file: File, storageId?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    return await nexus.File.create(
      orgLabel,
      projectLabel,
      {
        '@id': file.name,
        file: formData,
        storage: storageId,
      },
      // TODO: fix! https://github.com/BlueBrain/nexus/issues/784
      // @ts-ignore
      {
        extraHeaders: {
          'Content-Type': '',
        },
      }
    );
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
            makeFileLink(orgLabel, projectLabel, nexusFile),
          goToFile: (nexusFile: NexusFile) =>
            goToFile(orgLabel, projectLabel, nexusFile),
        }}
      />
    )
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    makeFileLink: (
      orgLabel: string,
      projectLabel: string,
      nexusFile: NexusFile
    ) =>
      `${
        state.config.basePath
      }/${orgLabel}/${projectLabel}/resources/${encodeURIComponent(
        nexusFile['@id']
      )}`,
  };
};

const mapDispatchToProps = (dispatch: any) => ({
  goToFile: (orgLabel: string, projectLabel: string, nexusFile: NexusFile) =>
    dispatch(
      push(
        `/${orgLabel}/${projectLabel}/resources/${encodeURIComponent(
          nexusFile['@id']
        )}`
      )
    ),
});
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(FileUploadContainer);
