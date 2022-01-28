import * as React from 'react';
import { Table, Button } from 'antd';
import * as moment from 'moment';

import { getDateString } from '../../../shared/utils';
import Copy from '../../../shared/components/Copy';
import { Input } from '../hooks/useInputs';
import TypesIconList from '../../../shared/components/Types/TypesIcon';

const { Column } = Table;

const InputsTable: React.FC<{ inputs: Input[] }> = ({ inputs }) => {
  const tableData = inputs.map(input => ({
    key: input.resourceId,
    resourceId: input.resourceId,
    createdAt: getDateString(moment(input.createdAt)),
    name: input.name,
    description: input.description,
    types: input.types,
  }));

  return (
    <Table dataSource={tableData} style={{ margin: 20 }} bordered>
      <Column title="Creation Time" dataIndex="createdAt" key="createdAt" />
      <Column title="Name" dataIndex="name" key="name" />
      <Column title="Description" dataIndex="description" key="description" />
      <Column
        title="Entity Type(s)"
        dataIndex="types"
        key="types"
        render={types => <TypesIconList type={types} full />}
      />
      <Column
        title="Actions"
        key="actions"
        dataIndex="resourceId"
        render={text => {
          return (
            <Copy
              render={(copySuccess, triggerCopy) => (
                <Button
                  onClick={(e: React.MouseEvent) => {
                    e.preventDefault();
                    e.stopPropagation();
                    triggerCopy(text);
                  }}
                >
                  {copySuccess ? 'Copied!' : 'Copy ID'}
                </Button>
              )}
            />
          );
        }}
      />
    </Table>
  );
};

export default InputsTable;
