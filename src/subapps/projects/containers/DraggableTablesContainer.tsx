import * as React from 'react';
import { Resource } from '@bbp/nexus-sdk';
import { useNexusContext } from '@bbp/react-nexus';
import Draggable from 'react-draggable';
import DataTableContainer from '../../../shared/containers/DataTableContainer';
import useNotification, {
  NexusError,
  parseNexusError,
} from '../../../shared/hooks/useNotification';

const DraggableTablesContainer: React.FC<{
  orgLabel: string;
  projectLabel: string;
  tables: any[];
  onDeprecate: () => void;
}> = ({ orgLabel, projectLabel, tables, onDeprecate }) => {
  const nexus = useNexusContext();
  const notification = useNotification();

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
      await nexus.Resource.update(
        orgLabel,
        projectLabel,
        encodeURIComponent(table['@id']),
        latest._rev,
        { ...latest, ...table }
      );
    } catch (error) {
      notification.error({
        message: 'Failed to save new position',
        description: parseNexusError(error as NexusError),
      });
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
            key={`drag-table-${table['@id']}}`}
          >
            <div
              key={`table-${table['@id']}`}
              style={{
                marginLeft: 20,
                marginTop: 50,
                width: '1200',
              }}
            >
              <DataTableContainer
                orgLabel={orgLabel}
                projectLabel={projectLabel}
                tableResourceId={table['@id']}
                key={`data-table-${table['@id']}}`}
                onDeprecate={onDeprecate}
                options={{
                  disableDelete: false,
                  disableAddFromCart: false,
                  disableEdit: false,
                }}
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
