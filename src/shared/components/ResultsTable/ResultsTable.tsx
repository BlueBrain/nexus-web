import * as React from 'react';
import * as moment from 'moment';
import { Input, Table } from 'antd';

import { parseProjectUrl, isISODate } from '../../utils/index';

import './ResultTable.less';

const { Search } = Input;

const PAGE_SIZE = 10;
const MAX_FILTER_LIMIT = 20;
const MIN_FILTER_LIMIT = 1;
const DATE_FORMAT = 'DD-MM-YYYY, HH:mm';

type ResultTableProps = {
  headerProperties?: {
    title: string;
    dataIndex: string;
  }[];
  items: {
    id: string;
    [dataIndex: string]: any;
  }[];
  pageSize?: number;
  handleClick: (self: string) => void;
};

const ResultsTable: React.FunctionComponent<ResultTableProps> = ({
  headerProperties,
  items,
  pageSize = PAGE_SIZE,
  handleClick,
}) => {
  const [searchValue, setSearchValue] = React.useState();

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
    ...(headerProperties
      ? headerProperties.map(({ title, dataIndex }) => {
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
                const base64EncodedUri = btoa(item && item.self.value);
                const studioResourceViewLink = `/studios/studio-resources/${base64EncodedUri}`;

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
                  onFilter: (filterValue: any, item: any) =>
                    item[dataIndex] === filterValue,
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

  return (
    <div className="result-table">
      <Table
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
            pageSize,
          }
        }
        title={() => (
          <div className="header">
            {(showPagination || !!searchValue) && (
              <Search
                className="search"
                value={searchValue}
                onChange={(e: React.FormEvent<HTMLInputElement>) => {
                  setSearchValue(e.currentTarget.value);
                }}
              />
            )}
            <div className="total">
              {total} {`Result${total > 1 ? 's' : ''}`}
            </div>
          </div>
        )}
      />
    </div>
  );
};

export default ResultsTable;
