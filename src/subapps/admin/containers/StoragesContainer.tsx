import * as React from 'react';
import { useNexusContext } from '@bbp/react-nexus';

import Storages from '../components/Projects/Storages';

export type StorageData = {
  maxFileSize?: number;
  capacity?: number;
  files: number;
  spaceUsed: number;
  '@id': string;
};

const StoragesContainer: React.FC<{
  orgLabel: string;
  projectLabel: string;
}> = ({ orgLabel, projectLabel }) => {
  const nexus = useNexusContext();
  const [storages, setStorages] = React.useState<StorageData[]>([]);

  React.useEffect(() => {
    loadStorages();
  }, []);

  const loadStorages = async () => {
    await nexus.Storage.list(orgLabel, projectLabel).then(response => {
      Promise.all(
        response._results.map(storage => {
          return Promise.all([
            nexus.Storage.get(
              orgLabel,
              projectLabel,
              encodeURIComponent(storage['@id'])
            ),
            nexus.Storage.statistics(
              orgLabel,
              projectLabel,
              encodeURIComponent(storage['@id'])
            ),
          ]);
        })
      ).then(results => {
        setStorages(parseResponses(results));
      });
    });
  };

  const parseResponses = (storagesData: any[][]) => {
    return storagesData.map(storage => {
      const { maxFileSize, capacity } = storage[0];
      const { files, spaceUsed } = storage[1];

      return {
        maxFileSize,
        capacity,
        files,
        spaceUsed,
        '@id': storage[0]['@id'],
      };
    });
  };

  if (storages.length < 1) return null;

  return <Storages storages={storages} />;
};

export default StoragesContainer;
