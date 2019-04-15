import * as React from 'react';
import { isBrowser } from '../../utils';
import { Resource, NexusFile } from '@bbp/nexus-sdk';
import { notification } from 'antd';

const useNexusFile = (
  resource: Resource,
  predicate: (resource: Resource) => boolean,
  getFilePreview: (selfUrl: string) => Promise<NexusFile>
) => {
  const [file, setFile] = React.useState<NexusFile | null>(null);
  React.useEffect(() => {
    if (!file && predicate(resource)) {
      getFilePreview(resource.self)
        .then((nexusFile: NexusFile) => {
          setFile(nexusFile);
        })
        .catch((error: Error) => {
          notification.error({
            message: 'A file loading error occured',
            description: error.message,
            duration: 0,
          });
          // tslint:disable-next-line:no-console
          console.error(error);
        });
    }
  }, []);
  return file;
};

export default useNexusFile;
