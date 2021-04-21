import * as React from 'react';
import { useNexusContext } from '@bbp/react-nexus';
import Draggable from 'react-draggable';

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

  const onPostionChange = (
    table: any,
    position: {
      positionX: number;
      positionY: number;
    }
  ) => {
    table.positionX = position.positionX;
    table.positionY = position.positionY;

    return nexus.Resource.update(
      orgLabel,
      projectLabel,
      encodeURIComponent(table['@id']),
      table._rev,
      table
    );
  };

  return (
    <>
      {tables &&
        tables.length > 0 &&
        tables.map(table => (
          <DraggableTable
            table={table}
            onPostionChange={onPostionChange}
            key={`table-${table['@id']}}`}
          >
            <div
              key={`table-${table['@id']}`}
              style={{ margin: 20, width: '1200' }}
            >
              <DataTableContainer
                orgLabel={orgLabel}
                projectLabel={projectLabel}
                tableResourceId={table['@id']}
              />
            </div>
          </DraggableTable>
        ))}
    </>
  );
};

const DraggableTable: React.FC<{
  table: any;
  onPostionChange: (
    table: any,
    position: {
      positionX: number;
      positionY: number;
    }
  ) => void;
}> = ({ table, onPostionChange, children }) => {
  const handleStop = (event: any, data: any) => {
    const { x, y } = data;

    if (table.positionX === x && table.positionY === y) return;

    onPostionChange(table, {
      positionX: x,
      positionY: y,
    });
  };

  return (
    <Draggable
      bounds=".steps-board"
      onStop={handleStop}
      defaultPosition={
        table.positionX && table.positionY
          ? { x: table.positionX, y: table.positionY }
          : undefined
      }
    >
      {children}
    </Draggable>
  );
};

export default TableContainer;
