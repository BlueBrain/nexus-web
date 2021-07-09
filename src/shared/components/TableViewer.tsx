import * as React from 'react';
import { Table } from 'antd';

const TableViewer: React.FC<{ name: string; data: any }> = ({ name, data }) => {
  const columnTitles = data.shift();

  const columns = columnTitles.map((header: any) => ({
    title: header,
    dataIndex: header,
    key: header,
  }));

  const dataSource = () => {
    return data.map((line: any[]) => {
      const tableEntry: any = {};

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
      <Table columns={columns} dataSource={tableData} />
    </div>
  );
};

export default TableViewer;
