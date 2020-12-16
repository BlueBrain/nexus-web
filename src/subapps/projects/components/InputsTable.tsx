import * as React from 'react';
import { Table, Tag, Button } from 'antd';
import * as moment from 'moment';

import { labelOf } from '../../../shared/utils';

export type Input = {
  createdAt: string;
  name?: string;
  resourceId: string;
  types: string[];
  description?: string;
};

const { Column } = Table;

const InputsTable: React.FC<{ inputs: Input[] }> = ({ inputs }) => {
  const tableData = inputs.map(input => ({
    key: input.resourceId,
    createdAt: moment(input.createdAt).format('DD.MM.YYYY - HH:MM'),
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
        render={types => (
          <>
            {types.map((type: string) => (
              <Tag style={{ margin: 3 }} color="blue" key={type}>
                {labelOf(type)}
              </Tag>
            ))}
          </>
        )}
      />
      <Column
        title="Actions"
        key="actions"
        render={() => <Button>Copy Id</Button>}
      />
    </Table>
  );
};

export default InputsTable;
