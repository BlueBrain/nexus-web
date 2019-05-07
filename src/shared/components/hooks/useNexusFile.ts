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
  const [loading, setLoading] = React.useState(false);
  const hasFileInResource = predicate(resource);
  React.useEffect(() => {
    if (!file && hasFileInResource) {
      setLoading(true);
      getFilePreview(resource.self)
        .then((nexusFile: NexusFile) => {
          setLoading(false);
          setFile(nexusFile);
        })
        .catch((error: Error) => {
          setLoading(false);
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
  return {
    file,
    hasFileInResource,
    loading,
  };
};

export default useNexusFile;
