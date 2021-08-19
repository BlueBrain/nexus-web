import * as React from 'react';
import { useNexusContext } from '@bbp/react-nexus';

import Storages from '../components/Projects/Storages';

const StoragesContainer: React.FC<{
  orgLabel: string;
  projectLabel: string;
}> = ({ orgLabel, projectLabel }) => {
  const nexus = useNexusContext();
  const [storages, setStorages] = React.useState<any[]>();

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
            nexus.httpGet({
              path: `https://dev.nexus.ocp.bbp.epfl.ch/v1/storages/${orgLabel}/${projectLabel}/${encodeURIComponent(
                storage['@id']
              )}/statistics`,
            }),
          ]);
        })
      )
        .then(results => {
          setStorages(parseResponses(results));
        })
        .catch(error => {
          // fail silently
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

  if (!storages) return null;

  return <Storages storages={storages} />;
};

export default StoragesContainer;
