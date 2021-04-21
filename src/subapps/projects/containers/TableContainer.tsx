import * as React from 'react';
import { useNexusContext } from '@bbp/react-nexus';

import { isTable } from '../utils';
import { displayError } from '../components/Notifications';
import DataTableContainer from '../../../shared/containers/DataTableContainer';

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
          })
          .catch(error => {
            displayError(error, 'Failed to load tables');
          })
      )
      .catch(error => {
        displayError(error, 'Failed to load tables');
      });
  }, [orgLabel, projectLabel, stepId]);

  return (
    <>
      {tables &&
        tables.length > 0 &&
        tables.map(table => (
          <div
            key={`table-${table['@id']}`}
            style={{ margin: 20, width: '1200' }}
          >
            <DataTableContainer
              orgLabel={orgLabel}
              projectLabel={projectLabel}
              tableResourceId={table['@id']}
            ></DataTableContainer>
          </div>
        ))}
    </>
  );
};

export default TableContainer;
