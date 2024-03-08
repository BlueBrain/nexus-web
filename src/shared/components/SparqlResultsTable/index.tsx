import * as React from 'react';
import moment from 'moment';
import { Input, Table, Button, Tooltip, Typography } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import { omit, difference } from 'lodash';
import { parseProjectUrl, isISODate, getDateString } from '../../utils/index';
import { download } from '../../utils/download';
import './../../styles/result-table.scss';
import useNotification from '../../hooks/useNotification';
import FriendlyTimeAgo from '../FriendlyDate';

const { Search } = Input;

const PAGE_SIZE = 10;
const MAX_FILTER_LIMIT = 20;
const MIN_FILTER_LIMIT = 1;

export type HeaderProperties = {
  title: string;
  dataIndex: string;
}[];

export type ResultTableProps = {
  headerProperties?: HeaderProperties;
  items: {
    id: string;
    [dataIndex: string]: any;
  }[];
  pageSize?: number;
  handleClick: (self: string) => void;
  tableLabel?: string;
};

const SparqlResultsTable: React.FunctionComponent<ResultTableProps> = ({
  headerProperties,
  items,
  pageSize = PAGE_SIZE,
  handleClick,
  tableLabel,
}) => {
  const [selectedColumns, setSelectedColumns] = React.useState<
    HeaderProperties | undefined
  >(headerProperties);
  const [searchValue, setSearchValue] = React.useState<string>('');
  const [filteredValues, setFilteredValues] = React.useState<any>(null);
  const notification = useNotification();

  const filteredItems = items.filter(item => {
    return (
      Object.values(item)
        .join(' ')
        .toLowerCase()
        .search((searchValue || '').toLowerCase()) >= 0
    );
  });

  const tableItems = searchValue ? filteredItems : items;
  const total = tableItems.length;
  const showPagination = total > pageSize;
  const columnsToSelect =
    selectedColumns && selectedColumns.length > 0
      ? selectedColumns
      : headerProperties;
  const columnList = [
    ...(columnsToSelect
      ? columnsToSelect.map(({ title, dataIndex }) => {
          // We can create special renderers for the cells here
          let render;
          switch (title) {
            case 'Created At':
              render = (date: string) => (
                <span>
                  <FriendlyTimeAgo date={moment(date)} />
                </span>
              );
              break;
            case 'Project':
              render = (projectURI: string) => {
                if (projectURI) {
                  const [org, project] = parseProjectUrl(projectURI);
                  return (
                    <span>
                      <b>{org}</b> / {project}
                    </span>
                  );
                }
                return null;
              };
              break;
            default:
              render = (value: string) => {
                const item = items.find(item => item[dataIndex] === value);
                const studioResourceViewLink = item
                  ? `/?_self=${item.self.value}`
                  : '';
                if (isISODate(value)) {
                  return (
                    <a href={studioResourceViewLink}>
                      {getDateString(moment(value))}
                    </a>
                  );
                }

                return <a href={studioResourceViewLink}>{value}</a>;
              };

              break;
          }

          const distinctValues = filteredItems.reduce((memo, item) => {
            const value = item[dataIndex];
            if (value && !memo.includes(value)) {
              memo.push(value);
            }
            return memo;
          }, [] as any[]);

          const filterOptions =
            distinctValues.length > MIN_FILTER_LIMIT &&
            distinctValues.length < MAX_FILTER_LIMIT
              ? {
                  filters: distinctValues.map(value => ({
                    value,
                    text: isISODate(value)
                      ? getDateString(moment(value))
                      : value,
                  })),
                  filterMultiple: false,
                  filteredValue: filteredValues
                    ? filteredValues[dataIndex]
                    : null,
                  onFilter: (filterValue: any, item: any) => {
                    return item[dataIndex] === filterValue;
                  },
                }
              : {};
          return {
            title,
            dataIndex,
            render,
            className: `result-column ${dataIndex}`,
            sorter: (
              a: {
                [key: string]: any;
              },
              b: {
                [key: string]: any;
              }
            ) => {
              const sortA = a[dataIndex];
              const sortB = b[dataIndex];
              if (sortA < sortB) {
                return -1;
              }
              if (sortA > sortB) {
                return 1;
              }
              return 0;
            },
            ...filterOptions,
          };
        })
      : []),
  ];

  const onClickDownload = () => {
    const allColumnsTitles: string[] = headerProperties
      ? headerProperties.map(x => x.dataIndex)
      : [];
    const selectedColumnTitles = selectedColumns
      ? selectedColumns.map(x => x.dataIndex)
      : [];
    const columnsToOmit = difference(allColumnsTitles, selectedColumnTitles);
    if (tableItems) {
      const itemsToSave = tableItems.map(item =>
        omit(item, 'id', 'key', 'self', ...columnsToOmit)
      );
      const fieldValue = (key: string, value: string) =>
        value === null ? '' : value;
      const header = Object.keys(itemsToSave[0]);

      const csv = itemsToSave.map(row =>
        header
          .map((fieldName: any) => JSON.stringify(row[fieldName], fieldValue))
          .join(',')
      );

      csv.unshift(header.join(','));

      const csvOutput = csv.join('\r\n');

      download(`${tableLabel}.csv`, 'text/csv', csvOutput);

      notification.success({
        message: 'Tabled is saved successfully',
      });
    }
  };

  return (
    <div className="result-table">
      <Table
        onChange={(pagination, filters, sorters) => {
          setFilteredValues(filters);
        }}
        onRow={data => ({
          onClick: event => {
            event.preventDefault();
            handleClick(data.self.value);
          },
        })}
        columns={columnList}
        dataSource={tableItems}
        bordered
        pagination={
          showPagination && {
            total,
            defaultPageSize: PAGE_SIZE,
            pageSizeOptions: ['10', '20', '50', '100'],
            showSizeChanger: true,
          }
        }
        scroll={{ x: '100%' }}
        title={() => (
          <div className="header">
            <Typography.Title className="title" level={3}>
              {tableLabel}
            </Typography.Title>

            <div className="controls">
              <Search
                className="search"
                value={searchValue}
                onChange={(e: React.FormEvent<HTMLInputElement>) => {
                  setSearchValue(e.currentTarget.value);
                }}
              />
              <div className="total">
                {total} {`Result${total > 1 ? 's' : ''}`}
              </div>
              <Tooltip title="Download as .csv">
                <Button
                  type="default"
                  icon={<DownloadOutlined />}
                  onClick={onClickDownload}
                />
              </Tooltip>
            </div>
          </div>
        )}
      />
    </div>
  );
};

export default SparqlResultsTable;
