import * as React from 'react';
import { useNexusContext } from '@bbp/react-nexus';

import Storages from '../components/Projects/Storages';

const StoragesContainer: React.FC<{
  orgLabel: string;
  projectLabel: string;
}> = ({ orgLabel, projectLabel }) => {
  const nexus = useNexusContext();

  React.useEffect(() => {
    nexus.Storage.list(orgLabel, projectLabel)
      .then(response => {
        console.log('response', response);

        return Promise.all(
          response._results.map(storage => {
            return nexus.Storage.get(
              orgLabel,
              projectLabel,
              encodeURIComponent(storage['@id'])
            );

            // return nexus.httpGet({
            //   path: `https://dev.nexus.ocp.bbp.epfl.ch/v1/storages/${orgLabel}/${projectLabel}/${encodeURIComponent(
            //     storage['@id']
            //   )}/statistics`,
            // });
          })
        );
      })
      .then(resps => console.log(resps));
  });
  return <Storages />;
};

export default StoragesContainer;
