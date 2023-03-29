import * as React from 'react';
import { Table } from 'antd';

const TableViewer: React.FC<{ name: string; data: string[][] }> = ({
  name,
  data,
}) => {
  const columnTitles = data.shift();

  const columns =
    columnTitles &&
    columnTitles.map((header: string) => ({
      title: header,
      dataIndex: header,
      key: header,
      width: "auto"
    }));

  const dataSource = () => {
    return data.map((line: string[]) => {
      const tableEntry: any = {};

      columnTitles &&
        columnTitles.forEach((title: string, index: number) => {
          tableEntry[title] = line[index];
        });

      return tableEntry;
    });
  };

  const tableData = dataSource();

  return (
    <div>
      <h2>{name}</h2>
      <Table scroll={{ x: 3500 }} columns={columns} dataSource={tableData} />
    </div>
  );
};

export default TableViewer;
