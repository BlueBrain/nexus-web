import * as React from 'react';
import * as moment from 'moment';
import { Input, Table, Button, Tooltip, notification, Select } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import { omit, difference } from 'lodash';
import { parseProjectUrl, isISODate } from '../../utils/index';
import { download } from '../../utils/download';
import './../../styles/result-table.less';

const { Search } = Input;
const { Option } = Select;

const PAGE_SIZE = 10;
const MAX_FILTER_LIMIT = 20;
const MIN_FILTER_LIMIT = 1;
const DATE_FORMAT = 'DD-MM-YYYY, HH:mm';

type HeaderProperties = {
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
  tableLabel: string;
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
  const [filteredValues, setFilteredValues] = React.useState<Record<
    string,
    React.ReactText[] | null
  > | null>(null);

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
  const columnList = [
    ...(selectedColumns
      ? selectedColumns.map(({ title, dataIndex }) => {
          // We can create special renderers for the cells here
          let render;
          switch (title) {
            case 'Created At':
              render = (date: string) => <span>{moment(date).fromNow()}</span>;
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
                      {moment(value).format(DATE_FORMAT)}
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
                      ? moment(value).format(DATE_FORMAT)
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
        duration: 5,
      });
    }
  };

  const handleColumnSelect = (value: string[]) => {
    if (value && value.length === 0) {
      setSelectedColumns(headerProperties);
    } else {
      const selected = headerProperties?.filter(x => value.includes(x.title));
      setSelectedColumns(selected);
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
            <Search
              className="search"
              value={searchValue}
              onChange={(e: React.FormEvent<HTMLInputElement>) => {
                setSearchValue(e.currentTarget.value);
              }}
            />

            <Select
              allowClear
              mode="multiple"
              size={'middle'}
              placeholder="Please select columns"
              defaultValue={selectedColumns?.map(x => x.title)}
              value={selectedColumns?.map(x => x.title)}
              onChange={handleColumnSelect}
              className="select-column"
            >
              {headerProperties?.map(x => {
                return (
                  <Option key={x.dataIndex} value={x.title}>
                    {x.title}
                  </Option>
                );
              })}
            </Select>

            <Button
              onClick={() => {
                setFilteredValues(null);
                setSelectedColumns(headerProperties);
                setSearchValue('');
              }}
              type="primary"
              className="reset"
            >
              {' '}
              Reset
            </Button>

            <div className="controls">
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
