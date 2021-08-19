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
          setStorages(results);
        })
        .catch(error => {
          // fail to load silently
        });
    });
  };

  if (!storages) return null;

  return <Storages storages={storages} />;
};

export default StoragesContainer;
