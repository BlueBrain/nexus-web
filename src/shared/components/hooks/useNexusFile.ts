import * as React from 'react';
import { Resource, NexusFile } from '@bbp/nexus-sdk';
import { notification } from 'antd';

const getFilePreview = (selfUrl: string) =>
  NexusFile.getSelf(selfUrl, { shouldFetchFile: true });

const useNexusFile = (
  resource: Resource,
  predicate: (resource: Resource) => boolean
) => {
  const [file, setFile] = React.useState<NexusFile | null>(null);
  const [loading, setLoading] = React.useState(false);
  const hasFileInResource = predicate(resource);
  React.useEffect(() => {
    if (hasFileInResource) {
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
  }, [resource.id]);
  return {
    file,
    hasFileInResource,
    loading,
  };
};

export default useNexusFile;
