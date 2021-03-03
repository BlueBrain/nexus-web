import * as React from 'react';
import { useNexusContext } from '@bbp/react-nexus';

import { isTable } from '../utils';

const TableContainer: React.FC<{
  orgLabel: string;
  projectLabel: string;
  stepId: string;
}> = ({ orgLabel, projectLabel, stepId }) => {
  const nexus = useNexusContext();
  const [tables, setTables] = React.useState<any[] | undefined>([]);

  React.useEffect(() => {
    nexus.Resource.links(
      orgLabel,
      projectLabel,
      encodeURIComponent(stepId),
      'incoming'
    )
      .then(response =>
        Promise.all(
          response._results
            .filter(link => isTable(link))
            .map(link => {
              return nexus.Resource.get(
                orgLabel,
                projectLabel,
                encodeURIComponent(link['@id'])
              );
            })
        )
          .then(response => {
            setTables(response);
            console.log('response', response);
          })
          .catch(error => {
            // display error
          })
      )
      .catch(error => {
        // display error
      });
  }, []);

  return <div>test</div>;
};

export default TableContainer;
