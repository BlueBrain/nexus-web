import * as React from 'react';
import { Resource } from '@bbp/nexus-sdk';
import { useNexusContext } from '@bbp/react-nexus';
import Draggable from 'react-draggable';

import { displayError } from '../components/Notifications';
import DataTableContainer from '../../../shared/containers/DataTableContainer';

const DraggableTablesContainer: React.FC<{
  orgLabel: string;
  projectLabel: string;
  tables: any[];
}> = ({ orgLabel, projectLabel, tables }) => {
  const nexus = useNexusContext();

  const onPostionChange = async (
    table: any,
    position: {
      positionX: number;
      positionY: number;
    }
  ) => {
    table.positionX = position.positionX;
    table.positionY = position.positionY;
    try {
      const latest = (await nexus.Resource.get(
        orgLabel,
        projectLabel,
        encodeURIComponent(table['@id'])
      )) as Resource;
      const update = await nexus.Resource.update(
        orgLabel,
        projectLabel,
        encodeURIComponent(table['@id']),
        latest._rev,
        { ...latest, ...table }
      );
    } catch (error) {
      displayError(error, 'Failed to save new position');
    }
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

export default DraggableTablesContainer;
