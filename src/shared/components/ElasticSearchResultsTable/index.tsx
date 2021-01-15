import * as React from 'react';
import { Table, Tooltip, Button, Input, Select } from 'antd';
import { Resource } from '@bbp/nexus-sdk';
import { TablePaginationConfig } from 'antd/lib/table';
import * as prettyBytes from 'pretty-bytes';
import * as moment from 'moment';

import { UseSearchResponse } from '../../hooks/useSearchQuery';
import TypesIconList from '../Types/TypesIcon';
import { getResourceLabel } from '../../utils';
import { isISODate } from '../../utils/index';
import { convertMarkdownHandlebarStringWithData } from '../../utils/markdownTemplate';
import { parseURL } from '../../utils/nexusParse';
import { FILE_SCHEMA } from '../../types/nexus';
import './ResultTable.less';

const { Search } = Input;
const { Option } = Select;

const MAX_FILTER_LIMIT = 20;
const MIN_FILTER_LIMIT = 1;
const DATE_FORMAT = 'DD-MM-YYYY, HH:mm';

export interface ResultsGridProps {
  pagination: TablePaginationConfig;
  searchResponse: UseSearchResponse;
  onClickItem: (resource: Resource) => void;
}

const ElasticSearchResultsTable: React.FC<ResultsGridProps> = ({
  pagination,
  searchResponse,
  onClickItem,
}) => {
  const [searchValue, setSearchValue] = React.useState<string>('');

  const [filters, setFilters] = React.useState<Record<
    string,
    React.ReactText[] | null
  > | null>(null);
  const results = (searchResponse.data?.hits.hits || []).map(({ _source }) => {
    const { _original_source, ...everythingElse } = _source;

    const resource = {
      ...JSON.parse(_original_source),
      ...everythingElse,
    };

    return {
      ...resource,
      description: convertMarkdownHandlebarStringWithData(
        resource.description || '',
        resource
      ),
      type: (Array.isArray(resource['@type'])
        ? resource['@type']
        : [resource['@type']]
      ).map(typeURL => typeURL?.split('/').reverse()[0]),
      resourceLabel: getResourceLabel(resource),
      resourceAdminData: parseURL(resource._self),
      fileData: resource._constrainedBy === FILE_SCHEMA && {
        humanReadableFileSize: prettyBytes(resource._bytes),
      },
    };
  });

  const filteredItems = results.filter(item => {
    return (
      Object.values(item)
        .join(' ')
        .toLowerCase()
        .search((searchValue || '').toLowerCase()) >= 0
    );
  });

  console.log(filteredItems);

  const sorter = (dataIndex: string) => {
    return (
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
    };
  };

  const filter = (dataIndex: string) => {
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
            filters: distinctValues.map((value: any) => ({
              value,
              text: isISODate(value)
                ? moment(value).format(DATE_FORMAT)
                : value,
            })),
            filterMultiple: false,
            filteredValue: filters ? filters[dataIndex] : null,
            onFilter: (filterValue: any, item: any) => {
              return item[dataIndex] === filterValue;
            },
          }
        : {};
    return filterOptions;
  };

  const columns = [
    {
      title: 'label',
      dataIndex: 'label',
      key: 'label',
      sorter: sorter('label'),
      ...filter('label'),
      render: (text: string, resource: Resource) => {
        return getResourceLabel(resource);
      },
    },
    {
      title: 'Project',
      dataIndex: ['resourceAdminData', 'project'],
      key: 'project',
      render: (text: string, resource: Resource) => {
        return `${resource.resourceAdminData.org} | ${resource.resourceAdminData.project}`;
      },
    },
    {
      title: 'Schema',
      dataIndex: '_constrainedBy',
      sorter: sorter('_constrainedBy'),
      key: 'schema',
      ...filter('_constrainedBy'),
      render: (text: string, resource: Resource) => {
        return (
          <Tooltip title={resource._constrainedBy}>
            {text.split('/').reverse()[0]}
          </Tooltip>
        );
      },
    },
    {
      title: 'Types',
      dataIndex: '@type',
      key: '@type',
      sorter: sorter('@type'),
      render: (text: string, resource: Resource) => {
        const typeList =
          !!resource['@type'] &&
          (Array.isArray(resource['@type']) ? (
            <TypesIconList type={resource['@type']} />
          ) : (
            <TypesIconList type={[resource['@type']]} />
          ));
        return typeList;
      },
    },
  ];
  const [selectedColumns, setSelectedColumns] = React.useState(columns);

  const handleColumnSelect = (value: string[]) => {
    if (value && value.length === 0) {
      setSelectedColumns(columns);
    } else {
      const selected = columns?.filter(x => value.includes(x.title));
      setSelectedColumns(selected);
    }
  };

  const handleClickItem = (resource: Resource) => () => {
    onClickItem(resource);
  };
  return (
    <div className="result-table">
      <Table
        onChange={(pagination, filters, sorters) => {
          setFilters(filters);
        }}
        dataSource={filteredItems}
        columns={selectedColumns}
        pagination={pagination}
        title={() => (
          <div className="header">
            {
              <Search
                className="search"
                value={searchValue}
                onChange={(e: React.FormEvent<HTMLInputElement>) => {
                  setSearchValue(e.currentTarget.value);
                }}
              />
            }
            <Button
              onClick={() => {
                setFilters(null);
                setSelectedColumns(columns);
                setSearchValue('');
              }}
            >
              {' '}
              Reset
            </Button>
            <Select
              allowClear
              mode="multiple"
              size={'middle'}
              placeholder="Please select columns"
              defaultValue={selectedColumns?.map(x => x.title)}
              value={selectedColumns?.map(x => x.title)}
              onChange={handleColumnSelect}
              style={{ width: '50%' }}
            >
              {columns?.map(x => {
                return (
                  <Option key={x.title} value={x.title}>
                    {x.title}
                  </Option>
                );
              })}
            </Select>
          </div>
        )}
        onRow={resource => {
          return {
            onClick: handleClickItem(resource),
          };
        }}
      />
    </div>
  );
};

export default ElasticSearchResultsTable;
